from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
from dotenv import load_dotenv
from openai import OpenAI
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/compound', methods=['POST'])
def get_compound_details():
    try:
        data = request.json
        compound_name = data.get('compound_name')
        
        if not compound_name:
            return jsonify({'error': 'Compound name is required'}), 400

        # Updated prompt with more specific instructions
        prompt = f"""
        Create a JSON object for {compound_name} with the following structure:
        {{
            "formula": "molecular formula",
            "description": "brief description of the structure",
            "structure": [
                {{
                    "symbol": "atomic symbol (e.g., 'C', 'H', 'O')",
                    "x": x_coordinate (number),
                    "y": y_coordinate (number),
                    "z": z_coordinate (number),
                    "connections": [array of indices of connected atoms]
                }},
                ...
            ]
        }}

        Example for water (H2O):
        {{
            "formula": "H2O",
            "description": "Water molecule with a bent structure, oxygen atom bonded to two hydrogen atoms",
            "structure": [
                {{"symbol": "O", "x": 0, "y": 0, "z": 0, "connections": [1, 2]}},
                {{"symbol": "H", "x": 0.96, "y": 0, "z": -0.24, "connections": [0]}},
                {{"symbol": "H", "x": -0.96, "y": 0, "z": -0.24, "connections": [0]}}
            ]
        }}

        Provide ONLY the JSON object, no additional text.
        """

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{
                "role": "user",
                "content": prompt
            }],
            temperature=0.7
        )

        content = response.choices[0].message.content.strip()
        # Remove markdown code block if present
        content = content.replace('```json', '').replace('```', '').strip()
        
        # Ensure the response is valid JSON
        try:
            parsed_content = json.loads(content)
            # Validate structure
            if not isinstance(parsed_content.get('structure'), list):
                raise ValueError("Invalid structure format")
            return jsonify({'data': content})
        except json.JSONDecodeError as e:
            print(f"JSON Parse Error: {content}")
            return jsonify({'error': f'Invalid JSON response: {str(e)}'}), 500
        except ValueError as e:
            return jsonify({'error': str(e)}), 500

    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 