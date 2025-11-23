import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

# --- Tab 設定 ---
TAB_MAPPING = {
    "recommend": "精選推薦",
    "hokuriku": "北陸",
    "hokkaido": "北海道",
    "tohoku": "東北",
    "tokyo": "東京",
    "kansai": "關西",
    "kyushu": "九州",
    "shikoku": "四國",
    "okinawa": "沖繩",
    "kaohsiung": "高雄出發"
}

def setup_driver():
    print("啟動瀏覽器中...")
    chrome_options = Options()
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1600,1200")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36")
    
    try:
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        return driver
    except Exception as e:
        print(f"瀏覽器啟動失敗: {e}")
        return None

def scrape_data():
    driver = setup_driver()
    if not driver: return {}

    url = "https://www.eztravel.com.tw/"
    final_database = {}

    try:
        print(f"前往網址: {url}")
        driver.get(url)
        time.sleep(5) 

        # 1. 定位 Tabs_wrapper 並取得「紅線座標」
        print("正在設定座標基準線...")
        tabs_y_limit = 0
        try:
            # 找到按鈕區塊
            tabs_wrapper = driver.find_element(By.XPATH, "//div[contains(@class, 'Tabs_wrapper')]")
            driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", tabs_wrapper)
            time.sleep(2)
            
            # 取得它的 Y 座標 (高度)
            # 我們只抓這個高度 "以下" 的東西
            tabs_y_limit = tabs_wrapper.location['y'] + tabs_wrapper.size['height']
            print(f"✅ 基準線設定為 Y > {tabs_y_limit} (排除上方所有廣告)")
            
        except:
            print("❌ 嚴重錯誤：找不到 Tabs 區塊，無法設定過濾線")
            return {}

        # 2. 開始抓取
        for key, tab_text in TAB_MAPPING.items():
            print(f"\n🔍 處理 Tab: [{tab_text}]")
            items_list = []
            
            try:
                # [步驟 A] 點擊 Tab
                tab_xpath = f"//div[contains(@class, 'Tabs_wrapper')]//li//a[contains(text(), '{tab_text}')]"
                
                found_tabs = driver.find_elements(By.XPATH, tab_xpath)
                active_btn = None
                for btn in found_tabs:
                    if btn.is_displayed():
                        active_btn = btn
                        break
                
                if active_btn:
                    driver.execute_script("arguments[0].click();", active_btn)
                    print(f"  👆 已點擊，等待內容刷新 (4秒)...")
                    time.sleep(4) # 給它足夠時間載入
                    
                    # [步驟 B] 抓取全頁所有可能的標題 (不限制範圍)
                    # 使用 Selenium 找元素，因為我們需要查它的座標
                    all_titles = driver.find_elements(By.CSS_SELECTOR, "h3.title")
                    
                    valid_count = 0
                    for title_ele in all_titles:
                        if valid_count >= 5: break
                        
                        try:
                            # [過濾 1] 物理座標檢查
                            # 如果卡片在紅線上面 -> 跳過 (它是 Sidebar)
                            if title_ele.location['y'] < tabs_y_limit:
                                continue
                            
                            # 如果太下面 (例如 footer)，也跳過
                            if title_ele.location['y'] > tabs_y_limit + 6000:
                                continue

                            # [過濾 2] 結構檢查
                            # 往上找父層連結
                            card_link = title_ele.find_element(By.XPATH, "./ancestor::a")
                            
                            # 取得卡片 HTML 並清理腳本
                            card_html = card_link.get_attribute('outerHTML')
                            soup_card = BeautifulSoup(card_html, "html.parser")
                            for script in soup_card(["script", "style"]):
                                script.decompose()
                            
                            # 檢查必要特徵：一定要有 Description 和 Price Span
                            # Sidebar 廣告通常沒有 description class
                            desc_tag = soup_card.find("p", class_="description")
                            price_p = soup_card.find("p", class_="price")
                            
                            if desc_tag and price_p:
                                # 提取資料
                                title_text = soup_card.find("h3", class_="title").get_text(strip=True)
                                desc_text = desc_tag.get_text(strip=True)
                                
                                price_text = "0"
                                price_span = price_p.find("span")
                                if price_span:
                                    price_text = price_span.get_text(strip=True)
                                else:
                                    price_text = price_p.get_text(strip=True).replace("起", "").replace("$", "").strip()
                                
                                # 連結
                                href = soup_card.find("a", href=True)['href'] if soup_card.name != 'a' else soup_card['href']
                                full_link = "https://www.eztravel.com.tw" + href if not href.startswith("http") else href
                                
                                # 圖片
                                img_url = ""
                                img_tag = soup_card.find("img")
                                if img_tag:
                                    img_url = img_tag.get("src") or img_tag.get("data-src") or ""

                                items_list.append({
                                    "title": title_text,
                                    "desc": desc_text,
                                    "price": price_text,
                                    "img": img_url,
                                    "link": full_link
                                })
                                valid_count += 1
                                print(f"    ✅ 抓到: {title_text[:10]}... ${price_text}")
                        
                        except Exception as inner_e:
                            # 忽略單一卡片的解析錯誤 (例如元素消失)
                            continue

                else:
                    print(f"  ⚠️ 找不到 Tab 按鈕: {tab_text}")

            except Exception as e:
                print(f"  ❌ 錯誤: {e}")

            final_database[key] = items_list

    except Exception as e:
        print(f"程式發生錯誤: {e}")
    finally:
        driver.quit()
        return final_database

def generate_js_file(data):
    print("\n正在產生 JS 檔案...")
    js_content = "const tourDatabase = {\n"
    
    for key, items in data.items():
        js_content += f"  // {TAB_MAPPING.get(key, key)}\n"
        js_content += f"  {key}: [\n"
        for item in items:
            js_content += "    {\n"
            js_content += f"      title: {json.dumps(item['title'], ensure_ascii=False)},\n"
            js_content += f"      desc: {json.dumps(item['desc'], ensure_ascii=False)},\n"
            js_content += f"      price: \"{item['price']}\",\n"
            js_content += f"      img: \"{item['img']}\",\n"
            js_content += f"      link: \"{item['link']}\",\n"
            js_content += "    },\n"
        js_content += "  ],\n"
    
    js_content += "};\n"
    
    with open("tour_database.js", "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"✅ tour_database.js 建立完成！")

if __name__ == "__main__":
    data = scrape_data()
    generate_js_file(data)