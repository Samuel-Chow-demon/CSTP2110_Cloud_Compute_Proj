from enum import Enum
import os
from dotenv import load_dotenv

load_dotenv()

## ------------------------ Server Configuration And Defines
## these three should be stored in a secret key file
BACK_END_IP = os.getenv("BACK_END_IP")   #accept anywhere
BACK_END_PORT = int(os.getenv("PORT"))
SECRET_KEY = os.getenv("SECRET_KEY")

STREAM_ERROR_LIMIT = 10
SAMPLING_FRAME_TEST_CONNECTION = 20

## define message type
MSG_TYPE_ERROR = "error"

## Request Token Key
ACC_ID_KEY = "accID"
EXPIRE_TIME_KEY = "expTime"


## Define the stream source from different location ID
## already had the S3 gateway access and mapped as an X Drive
dictLocationIDToStream = {
    "S1" : r"X:\video\1.mp4",
    "S2" : r"X:\video\2.mp4",
    "S3" : r"X:\video\5.mp4",
    "S4" : r"X:\video\6.mp4",
    "S5" : r"X:\video\7.mp4",
}

## ------------------------- Detection And Calculation Defines
class DETECT_OBJ(Enum):
    OCCUPIED     = 0
    EMPTY        = 1

# (B, G, R)
class DETECT_OBJ_COLOR(Enum):
    OCCUPIED = (105, 78, 237)
    EMPTY = (135, 245, 127)
    NONE = (0, 0, 0)

class YOLO_MODEL_KEY(Enum):
    V11_N = 0
    V11_l_18JAN = 1
    V11_s_2FEB = 2

## already had the S3 gateway access and mapped as an X Drive
YOLO_model_dict = {
    YOLO_MODEL_KEY.V11_N : r"X:\model\yolo11n.pt",
    YOLO_MODEL_KEY.V11_l_18JAN : r"X:\model\yolo11_l_18Jan.pt",
    YOLO_MODEL_KEY.V11_s_2FEB : r"X:\model\yolo11_s_11Feb.pt",
}