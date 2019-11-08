import serial
import json
import time
import pandas as pd

df = pd.DataFrame(columns=["time", "weight"])

try:
    arduino = serial.Serial('COM3')
except:
    print("Check the port")


def write_data():
    global df
    while True:
        d_time = time.time()
        d_weight = str(arduino.readline())[2:-5]
        df = df.append({"time": d_time, "weight": d_weight},
                       ignore_index=True)
        df.to_csv("raw.csv")
        with open("data.json") as f:
            data = json.load(f)
        #data["data"].append({"time": d_time, "weight": d_weight})
        print(data)
        with open('data.json', 'w') as f:
            json.dump(data, f)


write_data()
