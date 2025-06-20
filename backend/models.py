from pydantic import BaseModel

class NEO(BaseModel):
    id: str
    name: str
    close_approach_date: str
    estimated_diameter_min: float
    estimated_diameter_max: float
    relative_velocity_kmh: float
    miss_distance_km: float
    is_potentially_hazardous: bool

    @staticmethod
    def from_api(obj):
        approach = obj['close_approach_data'][0]
        return NEO(
            id=obj['id'],
            name=obj['name'],
            close_approach_date=approach['close_approach_date'],
            estimated_diameter_min=obj['estimated_diameter']['kilometers']['estimated_diameter_min'],
            estimated_diameter_max=obj['estimated_diameter']['kilometers']['estimated_diameter_max'],
            relative_velocity_kmh=float(approach['relative_velocity']['kilometers_per_hour']),
            miss_distance_km=float(approach['miss_distance']['kilometers']),
            is_potentially_hazardous=obj['is_potentially_hazardous_asteroid']
        )

class MarsPhoto(BaseModel):
    id: int
    sol: int
    camera_name: str
    earth_date: str
    img_src: str
    rover_name: str

class APOD(BaseModel):
    date: str
    explanation: str
    media_type: str
    title: str
    url: str
    hdurl: str = None
