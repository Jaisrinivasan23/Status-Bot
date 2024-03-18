from flask import Flask, request, jsonify, render_template
import requests
import openai

app = Flask(__name__)

# Set your OpenAI API key here
openai.api_key = 'Openai ApiKey'

conversation_state = ''
order_status_active = False

def get_openai_response(user_input):
    system_message_content = """
    You are a helpful assistant for a homemade product delivery company, and you should respond to specific user queries with predefined responses. For instance:
    - If asked about ordering through chat or WhatsApp, say: "Sure yes, you can make an order here in the chat by sending me your address details with phone number. I will take help from a human agent to make an order for you & send you the invoice for payment. After receiving your address details our customer care executives will contact you for payment confirmation."
    - If asked about COD/Cash on delivery, respond: "Due to high return rate on COD orders as of now we stopped COD facility. All other payment options available on our website."
    - On password reset inquiries, guide: "To reset your password, go to the login page and click on 'Forgot Password.' Follow the instructions sent to your email..."
    - If asked, “Will your products work?” respond with: “Definitely you will enjoy the freshness of Company Name. Keep a simple routine and be consistent. Herbs will take care of the rest.”
    - When the user says “Not in stock” or “OUT OF STOCK,” answer: “Sorry for making you wait. Due to our reliance on our farm's produce for crafting our products, we occasionally fall slightly behind the demand. When we get the product back in stock we will update you. Do provide us your WhatsApp number to send you the reminder.”
    - For “I received a damaged product,” say: “Oh gosh! Sincere apologies for the inconvenience caused. Hope you understand we deliver through third-party couriers & too many people involved in delivering the goods to your doorstep. But we will take complete responsibility for the damage. Here are the solutions we can provide you: 1- Instant Refund for the damaged product. 2- Resend it to you on your next order. 3- Resend it immediately. We serve you accordingly.❤️”
    - If someone complains about “Poor customer response,” respond: “Sorry for the delay in responding to your messages. Ping me here I will help you. Since I’m an AI my capabilities are limited, Yet I try my best to serve you.”
    - On “When will I get my order?” inquiries, reply: “Are you waiting for your products? Please share your mobile number given in the order with me. I will help you track its status.”
    - For return queries like “Can I return an item?” state: "Certainly! You can return items within 30 days of purchase. Please follow our return process..."
    - When asked about “How to use avarampoo bath powder,” instruct: “1) Take the required quantity of this powder in a tray and Mix the powder with water to make a loose paste. 2) Apply to the body and face gently. 3) Rinse well while taking a bath. 4) Enjoy the fresh natural aroma and smooth texture of your skin after a bath.”
    - For questions on “What is a Loofah. What is the use of loofah. How to clean it post wash?” explain: "Loofahs are made from fibrous material found in gourd-like tropical fruits. The spongy texture is perfect for exfoliating skin to keep it smooth and sleek. To clean, rinse and dry the loofah after each use, and sanitize it regularly."
    - Regarding “Tell me your Office Working Hours,” respond: "Mon-Sat 9:30 AM to 6:30 PM. Sunday- Holiday."
    """
    messages = [
        {"role": "system", "content": system_message_content}
    ]
    messages.append({"role": "user", "content": user_input})
    try:
        response = openai.ChatCompletion.create(
            model='gpt-3.5-turbo-0613',
            messages=messages
        )
        choice = response.get('choices')[0]
        text = choice.get('message')['content']
    except Exception as e:
        text = f"Error: {e}"
    return text

def get_order_status_response(order_id):
    site_url = 'https://vaseegrahveda.com'
    consumer_key = 'Consumer_key'
    consumer_secret = 'consumer_secret'
    notes_api_url = f'{site_url}/wp-json/wc/v3/orders/{order_id}/notes?consumer_key={consumer_key}&consumer_secret={consumer_secret}'

    try:
        response = requests.get(notes_api_url)
        response.raise_for_status()

        notes = response.json()
        customer_notes = [note for note in notes if note['customer_note'] == True]
        if not customer_notes:
            raise ValueError('No customer notes found for this order')

        latest_customer_note = customer_notes[-1]
        return latest_customer_note['note']

    except requests.RequestException as e:
        return f'Failed to retrieve the last customer note. Error: {e}'

@app.route('/send-message', methods=['POST'])
def send_message():
    global conversation_state, order_status_active
    user_input = request.form.get('userInput', '').strip()

    if not user_input:
        return jsonify({'message': 'No input provided'}), 400

    if order_status_active:
        order_id = user_input
        if not order_id:
            return jsonify({'message': 'Please enter a valid order ID.'}), 400

        response = get_order_status_response(order_id)
        order_status_active = False  # Reset order status flag
        return jsonify({'message': response})

    else:
        if 'where is my order' in user_input.lower():
            order_status_active = True
            return jsonify({'message': 'Sure, please enter your order ID:'})
        else:
            response = get_openai_response(user_input)
            return jsonify({'message': response})

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
