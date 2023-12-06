from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import openai

app = Flask(__name__)
openai.api_key = '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' # add the API Key here

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    try:
        data = request.json
        user_query = data['query']
        
        response = openai.Completion.create(
            model="text-davinci-003",
            prompt=f"This user has a question related to UC Berkeley's classes. Their query is: {user_query}. [Additional context and URLs]",
            max_tokens=150
        )
        
        answer = response.choices[0].text.strip()
        
        return jsonify(answer=answer)

    except Exception as e:
        return jsonify(error=str(e)), 500

if __name__ == '__main__':
    app.run(debug=True)