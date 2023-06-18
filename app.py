from flask import Flask, render_template, request, jsonify
import openai
import re

app = Flask(__name__)
openai.api_key = "your_API_key"

# Set the maximum question count limit
MAX_QUESTION_COUNT = 15
# encoding 
pattern = r"\n"


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_response', methods=['POST'])
def get_response():
    # Retrieve the current question count
    question_count = int(request.headers.get('questionCount'))

    if question_count >= MAX_QUESTION_COUNT:
        return jsonify("Apologies! You have reached the limit of TalkGPT usage for today.")

    message = request.data.decode('utf-8')
    try:
        completion = openai.Completion.create(
            model="text-davinci-003",
            prompt=message,
            max_tokens=50,
            temperature=0.7,
            n=1,
            stop=None
        )
        response = completion.choices[0].text.strip()
        response = re.sub(pattern, "", response)
        

        if response.startswith("data:"):
            return jsonify("Apologies! The response format is not supported.")
        

        return jsonify(response)
    except openai.error.RateLimitError:
        return jsonify("Apologies! The application has reached its limit for this user.")
    except Exception as e:
        return jsonify("An error has occurred due to a technical issue. Please try again later.")

if __name__ == '__main__':
    app.run(debug=True)
