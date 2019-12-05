import os
import serial
import json
import time
import pandas as pd
from datetime import datetime, timedelta

df = pd.DataFrame(columns=["time", "weight"])

# get data from arduino port
try:
    arduino = serial.Serial('/dev/cu.usbmodem14101', 9600, timeout=5)
    print("Connected to arduino")
except Exception as e:
    print("Check the port: " + str(e))

prev_measure = -99999
prev_data = -99999
curr_data = -99999


def write_data():
    global df, prev_measure, prev_data, curr_data, arduino
    while True:

        curr_time = time.localtime()
        curr_time_string = time.strftime("%Y-%m-%d %H:%M:%S", curr_time)
        day_of_week = time.strftime("%A", curr_time)
        date = time.strftime("%Y-%m-%d", curr_time)

        day_of_week_decimal = time.strftime("%w", curr_time)
        start_of_week_date = (datetime.now() - timedelta(days=int(day_of_week_decimal))).strftime("%Y-%m-%d")
        raw_csv_filename = os.getcwd() + "/data/raw/raw-" + date + ".csv"
        curr_tree_json_filename = os.getcwd() + "/data/trees/tree-" + start_of_week_date + ".json"

        curr_measure = float(arduino.readline())

        # save all raw data to a csv file
        df = df.append({"time": curr_time_string, "weight": curr_measure}, ignore_index=True)
        df.to_csv(raw_csv_filename)

        print("Current measure: " + str(curr_measure))

        # init prev, curr, last
        if (prev_measure == -99999):
            prev_measure = curr_measure
        else:
            # look for the steady state
            if ((abs(prev_measure - curr_measure) <= 1)):

                # update current steady data
                if (curr_measure > 20):
                    curr_data = curr_measure

                # check if the weight of water cup has decreased
                if (prev_data - curr_data > 5):

                    # open a json file
                    try:
                        with open(curr_tree_json_filename, 'r') as f:
                            data = json.load(f)
                    except IOError:
                            # load failure indicates file is being created for the first time
                            data = {
                                day_of_week: {
                                    "activities": [],
                                    "total_volume": 0,
                                    "date": date
                                }
                            }

                    if day_of_week in data:
                        volume_of_day = data[day_of_week]["total_volume"]
                    else:
                        data[day_of_week] = {
                            "activities": [],
                            "total_volume": 0,
                            "date": date
                        }
                        volume_of_day = 0

                    incremental_volume = round(prev_data - curr_data, 0)
                    activity = {
                        "time": curr_time_string, 
                        "weight": curr_data, 
                        "prev_weight": prev_data, 
                        "volume": incremental_volume
                    }

                    # append data
                    data[day_of_week]["activities"].append(activity)
                    data[day_of_week]["total_volume"] = volume_of_day + incremental_volume
                    data[day_of_week]["date"] = date

                    print(activity)

                    # write data to the json file
                    with open(curr_tree_json_filename, 'w') as f:
                        json.dump(data, f, indent=4)

                # iterate
                prev_data = curr_data

        # iterate
        prev_measure = curr_measure


write_data()
