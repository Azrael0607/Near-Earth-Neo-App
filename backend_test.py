import requests
import unittest
import sys
from datetime import datetime, timedelta

class NASADashboardAPITester:
    def __init__(self, base_url="https://7346ac0b-3dda-49c4-8921-315bf5f4744b.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status=200, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            
            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                result = {
                    "name": name,
                    "status": "PASSED",
                    "response_code": response.status_code
                }
                
                # Add response data for successful tests
                try:
                    result["data"] = response.json()
                except:
                    result["data"] = "Non-JSON response"
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                result = {
                    "name": name,
                    "status": "FAILED",
                    "expected_code": expected_status,
                    "response_code": response.status_code
                }
            
            self.test_results.append(result)
            return success, response
            
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                "name": name,
                "status": "ERROR",
                "error": str(e)
            })
            return False, None

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        print("="*50)
        
        # Print failed tests
        failed_tests = [test for test in self.test_results if test["status"] != "PASSED"]
        if failed_tests:
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"  - {test['name']}: {test.get('error', '')}")
        
        print("\n")

def test_neo_api():
    """Test the Near Earth Object API endpoints"""
    tester = NASADashboardAPITester()
    
    # Test root endpoint
    tester.run_test("API Root", "GET", "")
    
    # Test NEO feed endpoint
    success, response = tester.run_test("NEO Feed", "GET", "neo/feed")
    
    if success:
        data = response.json()
        print(f"  - Element count: {data.get('element_count', 'N/A')}")
        print(f"  - NEO objects: {len(data.get('near_earth_objects', []))}")
        print(f"  - Alerts: {len(data.get('alerts', []))}")
        
        # Test with date parameters
        today = datetime.now().strftime('%Y-%m-%d')
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        tester.run_test(
            "NEO Feed with Date Range", 
            "GET", 
            "neo/feed", 
            params={"start_date": today, "end_date": tomorrow}
        )
    
    # Test NEO stats endpoint
    success, response = tester.run_test("NEO Stats", "GET", "neo/stats")
    
    if success:
        data = response.json()
        print(f"  - NEO count: {data.get('near_earth_object_count', 'N/A')}")
        print(f"  - Close approach count: {data.get('close_approach_count', 'N/A')}")
    
    # Test NEO details endpoint (requires an asteroid ID)
    # We'll get an ID from the feed if available
    asteroid_id = None
    if response and hasattr(response, 'json'):
        feed_data = response.json()
        near_earth_objects = feed_data.get('near_earth_objects', [])
        if near_earth_objects and len(near_earth_objects) > 0:
            asteroid_id = near_earth_objects[0].get('id')
    
    if asteroid_id:
        tester.run_test("NEO Details", "GET", f"neo/{asteroid_id}")
    
    return tester

def test_mars_rover_api():
    """Test the Mars Rover API endpoints"""
    tester = NASADashboardAPITester()
    
    # Test rovers endpoint
    success, response = tester.run_test("Mars Rovers", "GET", "mars/rovers")
    
    if success:
        data = response.json()
        rovers = data.get('rovers', [])
        print(f"  - Available rovers: {len(rovers)}")
        if rovers:
            rover_names = [rover.get('name') for rover in rovers]
            print(f"  - Rover names: {', '.join(rover_names)}")
    
    # Test latest photos endpoint for Perseverance
    success, response = tester.run_test("Perseverance Latest Photos", "GET", "mars/rovers/perseverance/latest_photos")
    
    if success:
        data = response.json()
        photos = data.get('latest_photos', [])
        print(f"  - Latest photos count: {len(photos)}")
        if photos:
            print(f"  - First photo date: {photos[0].get('earth_date', 'N/A')}")
    
    # Test photos with filters
    tester.run_test(
        "Filtered Mars Photos", 
        "GET", 
        "mars/rovers/curiosity/photos", 
        params={"sol": "1000", "camera": "FHAZ"}
    )
    
    return tester

def test_apod_api():
    """Test the Astronomy Picture of the Day API endpoints"""
    tester = NASADashboardAPITester()
    
    # Test APOD endpoint (today's picture)
    success, response = tester.run_test("APOD Today", "GET", "apod")
    
    if success:
        data = response.json()
        print(f"  - Title: {data.get('title', 'N/A')}")
        print(f"  - Date: {data.get('date', 'N/A')}")
        print(f"  - Media type: {data.get('media_type', 'N/A')}")
    
    # Test APOD with specific date
    specific_date = "2023-01-01"
    tester.run_test("APOD Specific Date", "GET", "apod", params={"date": specific_date})
    
    # Test random APOD
    success, response = tester.run_test("Random APOD", "GET", "apod/random")
    
    if success:
        data = response.json()
        if isinstance(data, list):
            print(f"  - Random APOD count: {len(data)}")
        else:
            print(f"  - Random APOD title: {data.get('title', 'N/A')}")
    
    return tester

def test_dashboard_summary():
    """Test the Dashboard Summary endpoint"""
    tester = NASADashboardAPITester()
    
    success, response = tester.run_test("Dashboard Summary", "GET", "dashboard/summary")
    
    if success:
        data = response.json()
        print(f"  - NEO count: {data.get('neo_count', 'N/A')}")
        print(f"  - Alerts count: {data.get('alerts_count', 'N/A')}")
        print(f"  - APOD title: {data.get('apod_title', 'N/A')}")
        print(f"  - Mars photos count: {data.get('mars_photos_count', 'N/A')}")
    
    return tester

def main():
    print("\n🚀 Testing NASA Space Engineering Dashboard API\n")
    
    # Test all API endpoints
    print("\n==== Testing NEO API ====")
    neo_tester = test_neo_api()
    
    print("\n==== Testing Mars Rover API ====")
    mars_tester = test_mars_rover_api()
    
    print("\n==== Testing APOD API ====")
    apod_tester = test_apod_api()
    
    print("\n==== Testing Dashboard Summary ====")
    dashboard_tester = test_dashboard_summary()
    
    # Print overall summary
    total_tests = neo_tester.tests_run + mars_tester.tests_run + apod_tester.tests_run + dashboard_tester.tests_run
    total_passed = neo_tester.tests_passed + mars_tester.tests_passed + apod_tester.tests_passed + dashboard_tester.tests_passed
    
    print("\n" + "="*50)
    print(f"📊 OVERALL TEST SUMMARY: {total_passed}/{total_tests} tests passed")
    print("="*50)
    
    return 0 if total_passed == total_tests else 1

if __name__ == "__main__":
    sys.exit(main())