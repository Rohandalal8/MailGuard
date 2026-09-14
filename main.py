import pandas as pd;
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier

dataset = pd.read_csv('data.csv')

x = dataset["input"]
y = dataset["output"]

x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)

vectorizer = TfidfVectorizer()

conversion = vectorizer.fit_transform(x_train)

# brain
model = RandomForestClassifier()

# model training
model.fit(conversion, y_train)

# prediction
new_data = ["Free gift waiting. This offer expires soon, so take action now. No reply is needed, act now!"]
x_test_transformed = vectorizer.transform(new_data)
prediction = model.predict(x_test_transformed)
print("Prediction:", prediction[0])