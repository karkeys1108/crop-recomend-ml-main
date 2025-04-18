**Crop IQ - Crop recommendation machine learning model**

> A powerful **AI-powered backend solution** for smarter farming, using **soil analysis** and **crop recommendation** based on real-world data and machine learning.



---

## 🚀 Project Overview

This project integrates **Machine Learning** and **Geospatial Analysis** to recommend the most suitable crop based on soil and climate data. It is designed to be a backend engine that can power any frontend application.

- ✅ Entirely **backend logic**
- 🌍 Uses **Google Earth Engine** for environmental data
- 📈 Powered by **Jupyter Notebook-based ML model**
- 🔗 Easily connectable via **Ngrok tunneling**

---

## ⚙️ Tech Stack

| Component         | Technology                      |
|------------------|----------------------------------|
| Machine Learning | Python, Scikit-learn (Catboost Algorithm , Gaussian NB) |
| Execution        | Google Colab (locally)       |
| Tunnel           | Ngrok (HTTP to localhost)        |
| Geo Data         | Google Earth Engine (JavaScript) |

---

## 🧪 Workflow

### 1️⃣ Soil Analysis using Google Earth Engine

- Open [Google Earth Engine Code Editor](https://code.earthengine.google.com/)
- Paste the JavaScript code from `soilanalysis.js`
- Select the region you want to analyze using longitude and lattitude 
- Extract parameters like **Soil Texture , Organic Content, Potassium, pH**
- Use these as input in your machine learning model


![Soil Output](images/output1.png)

---

### 2️⃣ Crop Recommendation with Machine Learning

- Run the `Crop_Recommendation.ipynb` in **Jupyter Notebook**
- This model uses soil parameters and weather data to recommend the best crop
- Note: Download the datasets `Crop_recommendation.csv` and  `RICE_TNAU_STXT.csv` from the Dataset directory

📌 Make sure to update your **Ngrok ID**:

```python
NGROK_URL = "https://your-ngrok-id.ngrok.io"
```

### 2️⃣ API Endpoint Testing in Thunder Clint 

![Soil Output](images/output2.png)