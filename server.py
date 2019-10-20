# -*- coding: utf-8 -*-
"""
Created on Sat Oct 19 20:41:09 2019
​
@author: artem
"""
​
import pandas_datareader 
import json
import random
from flask import Flask
app = Flask(__name__)
asset_name = ['AAPL','TSLA', 'YNDX','BAC']
stocks=pandas_datareader.get_data_yahoo(asset_name)
​
@app.route('/')
def hello():
​
    #stocks['Adj Close', 'NKE'].iloc[1]
    #if i >= len(stocks['Adj Close', 'NKE']):
    #    i = 0
    #i = i + 1
    #i = i + 1
    #return str(stocks['Adj Close', 'NKE'].iloc[1])
    
    return json.dumps({asset_name[0]: str(stocks['Adj Close', asset_name[0]].iloc[random.randrange(len(stocks['Adj Close', asset_name[0]]))]),
                       asset_name[1]: str(stocks['Adj Close', asset_name[1]].iloc[random.randrange(len(stocks['Adj Close', asset_name[1]]))]),
                       asset_name[2]: str(stocks['Adj Close', asset_name[2]].iloc[random.randrange(len(stocks['Adj Close', asset_name[2]]))]),
                       asset_name[3]: str(stocks['Adj Close', asset_name[3]].iloc[random.randrange(len(stocks['Adj Close', asset_name[3]]))])})
if __name__ == '__main__':
    i=0
    app.run()