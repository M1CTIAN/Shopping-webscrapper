import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_update():
    print(f"Checking connection to {BASE_URL}...")
    try:
        resp = requests.get(f"{BASE_URL}/")
        if resp.status_code != 200:
            print("Error: API is not reachable.")
            return
        print("API is online.")
    except Exception as e:
        print(f"Error connecting to API: {e}")
        return

    # 1. Get all products
    print("\nFetching tracked products...")
    resp = requests.get(f"{BASE_URL}/products")
    if resp.status_code != 200:
        print(f"Error fetching products: {resp.text}")
        return
    
    products_data = resp.json()
    products = products_data.get("products", [])
    
    if not products:
        print("No products found to update. Please add a product first using the frontend or API.")
        return

    print(f"Found {len(products)} products.")
    
    # 2. Update the first product
    product = products[0]
    product_id = product.get("product_id")
    product_name = product.get("product_name")
    
    print(f"\nTesting update for product: {product_name} (ID: {product_id})")
    print("Sending update request...")
    
    update_url = f"{BASE_URL}/track/update/{product_id}"
    resp = requests.post(update_url)
    
    if resp.status_code == 200:
        result = resp.json()
        print("\nUpdate Successful!")
        print(json.dumps(result, indent=2))
    else:
        print(f"\nUpdate Failed with status code {resp.status_code}")
        print(resp.text)

if __name__ == "__main__":
    test_update()
