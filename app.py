from flask import Flask, render_template, request, jsonify
import openai

app = Flask(__name__)
openai.api_key = '' # add the API Key here

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    user_query = data['query']
    response = openai.Completion.create(
        model="text-davinci-003",
        prompt=f"This user has a question related to UC Berkeley's classes. Their query is: {user_query}. [Additional context and URLs]",
        max_tokens=150
    )
    return jsonify(answer=response.choices[0].text.strip())

if __name__ == '__main__':
    app.run(debug=True)