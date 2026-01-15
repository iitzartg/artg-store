import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'How does instant delivery work?',
    answer:
      'After completing your purchase, you will receive your digital key or gift card code instantly via email. The product will also be available in your account dashboard. No shipping required - everything is digital!',
  },
  {
    question: 'Are the products authentic and legitimate?',
    answer:
      'Yes! All our products are 100% authentic and sourced directly from official distributors. We guarantee the legitimacy of every digital key and gift card we sell. If you encounter any issues, we offer full refunds.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept various payment methods including credit cards, debit cards, and other secure online payment options. All transactions are encrypted and processed securely.',
  },
  {
    question: 'Can I get a refund if I change my mind?',
    answer:
      'Yes, we offer refunds for unactivated keys within 7 days of purchase. However, once a key has been activated or used, it cannot be refunded. Please contact our support team for refund requests.',
  },
  {
    question: 'Do the keys work in my region?',
    answer:
      'Most of our keys are region-free and work globally. However, some products may have regional restrictions. We clearly indicate any regional limitations in the product description before purchase.',
  },
  {
    question: 'How long does it take to receive my order?',
    answer:
      'Digital products are delivered instantly after payment confirmation. You should receive your key or gift card code within minutes via email and in your account dashboard.',
  },
  {
    question: 'What if my key doesn\'t work?',
    answer:
      'If you encounter any issues with your key, please contact our support team immediately with your order number. We will investigate and provide a replacement or full refund if the key is found to be invalid.',
  },
  {
    question: 'Can I gift a product to someone else?',
    answer:
      'Yes! You can purchase products as gifts. Simply enter the recipient\'s email address during checkout, or forward the email with the key to them. Gift cards can also be purchased and sent directly.',
  },
  {
    question: 'Do you offer customer support?',
    answer:
      'Absolutely! Our customer support team is available 24/7 via email at support@artgstore.com. We typically respond within a few hours and are committed to resolving any issues you may have.',
  },
  {
    question: 'Are there any age restrictions?',
    answer:
      'Yes, you must be at least 18 years old to make purchases on our platform. Some games may also have age ratings that you should be aware of before purchasing.',
  },
  {
    question: 'Can I track my order?',
    answer:
      'Since all our products are digital and delivered instantly, there\'s no shipping to track. You can view all your orders and download your keys anytime from your account dashboard.',
  },
  {
    question: 'Do you have a mobile app?',
    answer:
      'Currently, we operate through our website which is fully optimized for mobile devices. We\'re working on a mobile app that will be available soon. Stay tuned for updates!',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <section className="text-center py-8">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <HelpCircle className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="neon-text">Frequently Asked Questions</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Find answers to common questions about our products and services
        </p>
      </section>

      {/* FAQ Items */}
      <section className="space-y-4">
        {faqData.map((faq, index) => (
          <div key={index} className="card">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-semibold pr-8">{faq.question}</h3>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </button>
            {openIndex === index && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Still Have Questions */}
      <section className="card text-center">
        <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
        <p className="text-gray-400 mb-6">
          Can't find the answer you're looking for? Our support team is here to help!
        </p>
        <Link to="/contact" className="btn-primary inline-block">
          Contact Us
        </Link>
      </section>
    </div>
  );
};

export default FAQ;
