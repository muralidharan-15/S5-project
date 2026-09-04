import unittest
from data.district_profiles import (
    fetch_live_coastal_vulnerability,
    fetch_live_dams_quality,
    fetch_live_urbanization,
    fetch_live_deforestation,
    fetch_live_drainage_systems,
    fetch_live_dam_details,
    get_district_environmental_features_live
)


class TestLiveAPIs(unittest.TestCase):

    def test_coastal_district_live_fetch(self):
        # Chennai (Coastal District)
        res = fetch_live_coastal_vulnerability("Chennai", 13.0827, 80.2707)
        self.assertIn("score", res)
        self.assertIn("wave_height_max", res)
        self.assertGreaterEqual(res["score"], 2.0)
        self.assertLessEqual(res["score"], 10.0)

    def test_inland_district_baseline(self):
        # Coimbatore (Inland District)
        res = fetch_live_coastal_vulnerability("Coimbatore", 11.0168, 76.9558)
        self.assertEqual(res["score"], 1.0)
        self.assertEqual(res["wave_height_max"], 0.0)
        self.assertIn("Inland District", res["source"])

    def test_dams_quality_live_fetch(self):
        # Salem / Mettur Dam basin
        res = fetch_live_dams_quality("Salem", 11.6643, 78.1460)
        self.assertIn("score", res)
        self.assertIn("river_discharge", res)
        self.assertGreaterEqual(res["score"], 1.0)
        self.assertLessEqual(res["score"], 10.0)

    def test_urbanization_live_fetch(self):
        # Chennai (Urban metropolis)
        res = fetch_live_urbanization("Chennai", 13.0827, 80.2707)
        self.assertIn("score", res)
        self.assertIn("osm_type", res)
        self.assertGreaterEqual(res["score"], 1.0)
        self.assertLessEqual(res["score"], 10.0)

    def test_deforestation_live_fetch(self):
        # Nilgiris (Forest region)
        res = fetch_live_deforestation("Nilgiris", 11.4102, 76.6950)
        self.assertIn("score", res)
        self.assertIn("soil_moisture", res)
        self.assertGreaterEqual(res["score"], 1.0)
        self.assertLessEqual(res["score"], 10.0)

    def test_drainage_systems_live_fetch(self):
        # Coimbatore (Elevated plateau) vs Chennai (Coastal basin)
        res_coimbatore = fetch_live_drainage_systems("Coimbatore", 11.0168, 76.9558)
        self.assertIn("score", res_coimbatore)
        self.assertIn("elevation", res_coimbatore)
        self.assertGreaterEqual(res_coimbatore["elevation"], 100.0)

    def test_dam_details_live_fetch(self):
        # Salem -> Mettur Dam
        salem_dam = fetch_live_dam_details("Salem", 11.6643, 78.1460)
        self.assertEqual(salem_dam["dam_name"], "Mettur Dam (Stanley Reservoir)")
        self.assertEqual(salem_dam["river_basin"], "Kaveri River")
        self.assertEqual(salem_dam["capacity_tmc"], 93.4)

        # Chengalpattu -> Chembarambakkam Reservoir
        cgl_dam = fetch_live_dam_details("Chengalpattu", 12.6820, 79.9800)
        self.assertEqual(cgl_dam["dam_name"], "Chembarambakkam Reservoir")
        self.assertEqual(cgl_dam["river_basin"], "Adyar River")

    def test_district_environmental_features_live(self):
        profile = get_district_environmental_features_live("Chennai", 13.0827, 80.2707)
        self.assertIn("CoastalVulnerability", profile)
        self.assertIn("WaveHeightMax", profile)
        self.assertIn("CoastalSource", profile)
        self.assertIn("DamsQuality", profile)
        self.assertIn("RiverDischarge", profile)
        self.assertIn("DamsSource", profile)
        self.assertIn("Urbanization", profile)
        self.assertIn("OsmType", profile)
        self.assertIn("UrbanSource", profile)
        self.assertIn("Deforestation", profile)
        self.assertIn("SoilMoisture", profile)
        self.assertIn("ForestSource", profile)
        self.assertIn("DrainageSystems", profile)
        self.assertIn("Elevation", profile)
        self.assertIn("DrainageSource", profile)
        self.assertIn("DamDetails", profile)


if __name__ == "__main__":
    unittest.main()





