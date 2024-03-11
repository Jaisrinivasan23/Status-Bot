function checkOrderStatus() {
    const orderId = document.getElementById('user-input').value;
    if (!orderId) {
      alert('Please enter an order ID');
      return;
    }
  
    // Your WooCommerce site details
    const siteUrl = 'https://vaseegrahveda.com';
    const consumerKey = 'ck_b505b14462d4e0e9c3b1bb371a9f9121729812b3';
    const consumerSecret = 'cs_1d1edd85e26f5e345d2e6415edde3adc559065a9';
  
    // API URL to fetch order notes
    const notesApiUrl = `${siteUrl}/wp-json/wc/v3/orders/${orderId}/notes?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;
  
    fetch(notesApiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Order not found or unable to retrieve notes');
        }
        return response.json();
      })
      .then(notes => {
        // Filter notes to find those marked as customer notes
        const customerNotes = notes.filter(note => note.customer_note === true);
  
        if (customerNotes.length === 0) {
          throw new Error('No customer notes found for this order');
        }
  
        // Assuming the API returns the notes in chronological order,
        // the last note in the array is the most recent one intended for the customer.
        const latestCustomerNote = customerNotes[customerNotes.length - 1];
  
        const chatOutput = document.getElementById('chat-output');
        chatOutput.innerHTML += `<div>${latestCustomerNote.note}</div>`;
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to retrieve the last customer note. Make sure the order ID is correct.');
      });
  }
  
  document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      checkOrderStatus();
    }
  });
  