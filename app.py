import openai
from flask import Flask, request, jsonify

app = Flask(__name__)
openai.api_key = ''

@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    user_query = data['query']
    response = openai.Completion.create(
        model="your-custom-assistant-id",  # Use your custom assistant ID
        prompt=f"Your custom prompt with the user query: {user_query}",
        max_tokens=150
    )
    return jsonify(answer=response.choices[0].text.strip())

if __name__ == '__main__':
    app.run(debug=True)
