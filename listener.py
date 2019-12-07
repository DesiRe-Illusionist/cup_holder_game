import os
import serial
import json
import time
import pandas as pd
from datetime import datetime, timedelta
import firebase_admin
from firebase_admin import credentials, firestore, db
from array import *
import random

cred = credentials.Certificate("./ServiceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://cupholder-de568.firebaseio.com/'
})

prev_measure = -99999
prev_data = -99999
curr_data = -99999

def write_data():
    global prev_measure, prev_data, curr_data
    while True:
        time.sleep(0.2)
        curr_time = time.localtime()
        curr_time_string = time.strftime("%Y-%m-%d %H:%M:%S", curr_time)
        day_of_week = time.strftime("%A", curr_time)
        date = time.strftime("%Y-%m-%d", curr_time)

        day_of_week_decimal = time.strftime("%w", curr_time)
        start_of_week_date = (datetime.now() - timedelta(days=int(day_of_week_decimal))).strftime("%Y-%m-%d")

        curr_measure = db.reference('/data').get()
        print("Current measure: " + str(curr_measure))

        prev_state_ref = db.reference("/previous_state")
        prev_state_content = prev_state_ref.get()
        if prev_state_content == None:
            prev_state_ref.set({
                "cat_index": random.randint(0, 5),
                "flower_index": random.randint(0, 5)
            })

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

                    incremental_volume = round(prev_data - curr_data, 0)
                    activity = {
                        "time": curr_time_string, 
                        "weight": curr_data, 
                        "prev_weight": prev_data, 
                        "volume": incremental_volume,
                    }

                    print("new activities identified: " + str(activity))

                    # append data
                    activities_ref = db.reference("/"+start_of_week_date+"/"+day_of_week+"/activities")
                    activities_content = activities_ref.get()
                    if activities_content != None:
                        activities_content.append(activity)
                        activities_ref.set(activities_content)
                    else:
                        activities_ref.set([activity])

                    total_volume_ref = db.reference("/"+start_of_week_date+"/"+day_of_week +"/total_volume")
                    total_volume_content = total_volume_ref.get()
                    if total_volume_content != None:
                        total_volume_ref.set(total_volume_content + incremental_volume)
                    else:
                        total_volume_ref.set(incremental_volume)

                    db.reference("/"+start_of_week_date+"/"+day_of_week +"/date").set(date)


                # iterate
                prev_data = curr_data

        # iterate
        prev_measure = curr_measure


write_data()
