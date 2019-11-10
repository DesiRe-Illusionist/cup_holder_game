import serial
import json
import time
import pandas as pd

df = pd.DataFrame(columns=["time", "weight"])

# get data from arduino port
try:
    arduino = serial.Serial('COM3', 9600, timeout=5)
    print("Connected to arduino")
except:
    print("Check the port")

prev_measure = -99999
prev_data = -99999
curr_data = -99999


def write_data():
    global df, prev_measure, prev_data, curr_data, arduino
    while True:
        curr_time = time.time()
        curr_measure = float(str(arduino.readline())[2:-5])

        # save all raw data to a csv file
        df = df.append({"time": curr_time, "weight": curr_measure},
                       ignore_index=True)
        df.to_csv("raw.csv")

        print("-------------------------------------------")
        print("Previous measure: " + str(prev_measure))
        print("Current measure: " + str(curr_measure))
        print("Previous data: " + str(prev_data))
        print("Current data: " + str(curr_data))

        # init prev, curr, last
        if (prev_measure == -99999):
            prev_measure = curr_measure
        else:
            # look for the steady state
            if ((abs(prev_measure - curr_measure) <= 1)):

                # update current steady data
                if (curr_measure > 5):
                    curr_data = curr_measure

                # check if the weight of water cup has decreased
                if (prev_data - curr_data > 5):
                    print()
                    print("Data found: ")

                    # open a json file
                    with open("data.json") as f:
                        data = json.load(f)

                    # append data
                    data["data"].append(
                        {"time": curr_time, "weight": curr_data, "prev_weight": prev_data, "volume": round(prev_data - curr_data, 2)})
                    a = {"time": curr_time, "weight": curr_data,
                         "prev_weight": prev_data, "volume": round(prev_data - curr_data, 2)}
                    print(a)

                    # write data to the json file
                    with open('data.json', 'w') as f:
                        json.dump(data, f)

                # iterate
                prev_data = curr_data

        # iterate
        prev_measure = curr_measure
        print()
        print("After: ")
        print("Previous measure: " + str(prev_measure))
        print("Current measure: " + str(curr_measure))
        print("Previous data: " + str(prev_data))
        print("Current data: " + str(curr_data))


write_data()
