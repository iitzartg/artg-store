import { FileText, Scale, AlertTriangle, CheckCircle } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <section className="text-center py-8">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Scale className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="neon-text">Terms of Service</span>
        </h1>
        <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
      </section>

      {/* Introduction */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
        <p className="text-gray-300 leading-relaxed">
          By accessing and using ArtG Store's website and services, you accept and agree to be bound
          by the terms and provision of this agreement. If you do not agree to abide by the above,
          please do not use this service.
        </p>
        <p className="text-gray-300 leading-relaxed mt-4">
          These Terms of Service ("Terms") govern your access to and use of ArtG Store's website,
          products, and services. Please read these Terms carefully before using our services.
        </p>
      </section>

      {/* Eligibility */}
      <section className="card">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="w-6 h-6 text-neon-green" />
          <h2 className="text-2xl font-bold">Eligibility</h2>
        </div>
        <p className="text-gray-300 leading-relaxed mb-4">
          To use our services, you must:
        </p>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Be at least 18 years of age</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Have the legal capacity to enter into binding agreements</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Provide accurate and complete information when creating an account</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Comply with all applicable laws and regulations</span>
          </li>
        </ul>
      </section>

      {/* Account Terms */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Account Registration</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          When you create an account with us, you agree to:
        </p>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Maintain the security of your account credentials</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Provide accurate, current, and complete information</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Notify us immediately of any unauthorized use of your account</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Accept responsibility for all activities under your account</span>
          </li>
        </ul>
        <p className="text-gray-300 leading-relaxed mt-4">
          We reserve the right to suspend or terminate accounts that violate these terms or engage in
          fraudulent activity.
        </p>
      </section>

      {/* Products and Services */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Products and Services</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Digital Products</h3>
            <p className="text-gray-300 leading-relaxed">
              We sell digital game keys and gift cards. All products are delivered digitally via
              email and your account dashboard. Physical products are not available.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Product Availability</h3>
            <p className="text-gray-300 leading-relaxed">
              Product availability is subject to change without notice. We reserve the right to
              limit quantities, refuse orders, or discontinue products at any time.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Pricing</h3>
            <p className="text-gray-300 leading-relaxed">
              All prices are displayed in Tunisian Dinar (TND) unless otherwise stated. Prices are
              subject to change without notice. We reserve the right to correct pricing errors.
            </p>
          </div>
        </div>
      </section>

      {/* Payment Terms */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Payment Terms</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Payment Methods</h3>
            <p className="text-gray-300 leading-relaxed">
              We accept various payment methods as displayed during checkout. All payments are
              processed securely through trusted third-party payment processors.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Payment Authorization</h3>
            <p className="text-gray-300 leading-relaxed">
              By providing payment information, you authorize us to charge the specified amount to
              your chosen payment method. You are responsible for ensuring sufficient funds are
              available.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Refunds</h3>
            <p className="text-gray-300 leading-relaxed">
              Refunds are available for unactivated keys within 7 days of purchase. Once a key has
              been activated or used, it cannot be refunded. Refund requests must be submitted
              through our support system.
            </p>
          </div>
        </div>
      </section>

      {/* Prohibited Uses */}
      <section className="card">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">Prohibited Uses</h2>
        </div>
        <p className="text-gray-300 leading-relaxed mb-4">
          You agree not to use our services:
        </p>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start space-x-3">
            <span className="text-red-400 mt-1">•</span>
            <span>For any unlawful purpose or to solicit unlawful acts</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-red-400 mt-1">•</span>
            <span>To violate any international, federal, provincial, or state regulations or laws</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-red-400 mt-1">•</span>
            <span>To transmit viruses, malware, or any harmful code</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-red-400 mt-1">•</span>
            <span>To collect or track personal information of others</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-red-400 mt-1">•</span>
            <span>To spam, phish, or engage in fraudulent activities</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-red-400 mt-1">•</span>
            <span>To interfere with or disrupt our services or servers</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-red-400 mt-1">•</span>
            <span>To resell or redistribute digital keys without authorization</span>
          </li>
        </ul>
      </section>

      {/* Intellectual Property */}
      <section className="card">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="w-6 h-6 text-neon-blue" />
          <h2 className="text-2xl font-bold">Intellectual Property</h2>
        </div>
        <p className="text-gray-300 leading-relaxed mb-4">
          All content on our website, including text, graphics, logos, images, and software, is the
          property of ArtG Store or its content suppliers and is protected by copyright and trademark
          laws.
        </p>
        <p className="text-gray-300 leading-relaxed">
          You may not reproduce, distribute, modify, or create derivative works from our content
          without express written permission. Digital keys and gift cards purchased from us are for
          personal use only and may not be resold or redistributed.
        </p>
      </section>

      {/* Limitation of Liability */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          To the fullest extent permitted by law, ArtG Store shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages, or any loss of profits or
          revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or
          other intangible losses.
        </p>
        <p className="text-gray-300 leading-relaxed">
          Our total liability for any claims arising from your use of our services shall not exceed
          the amount you paid to us in the 12 months preceding the claim.
        </p>
      </section>

      {/* Warranty Disclaimer */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Warranty Disclaimer</h2>
        <p className="text-gray-300 leading-relaxed">
          Our services are provided "as is" and "as available" without warranties of any kind,
          either express or implied. We do not warrant that our services will be uninterrupted,
          secure, or error-free. We disclaim all warranties, express or implied, including but not
          limited to implied warranties of merchantability and fitness for a particular purpose.
        </p>
      </section>

      {/* Indemnification */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Indemnification</h2>
        <p className="text-gray-300 leading-relaxed">
          You agree to indemnify, defend, and hold harmless ArtG Store and its officers, directors,
          employees, and agents from any claims, damages, losses, liabilities, and expenses
          (including legal fees) arising from your use of our services, violation of these Terms,
          or infringement of any rights of another party.
        </p>
      </section>

      {/* Termination */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Termination</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          We may terminate or suspend your account and access to our services immediately, without
          prior notice, for any reason, including but not limited to:
        </p>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Breach of these Terms of Service</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Fraudulent or illegal activity</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Request by law enforcement or government agencies</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Extended periods of inactivity</span>
          </li>
        </ul>
      </section>

      {/* Changes to Terms */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
        <p className="text-gray-300 leading-relaxed">
          We reserve the right to modify these Terms at any time. We will notify users of material
          changes by posting the updated Terms on our website and updating the "Last updated" date.
          Your continued use of our services after such modifications constitutes acceptance of the
          updated Terms.
        </p>
      </section>

      {/* Governing Law */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
        <p className="text-gray-300 leading-relaxed">
          These Terms shall be governed by and construed in accordance with the laws of Tunisia,
          without regard to its conflict of law provisions. Any disputes arising from these Terms
          shall be subject to the exclusive jurisdiction of the courts of Tunisia.
        </p>
      </section>

      {/* Contact */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          If you have any questions about these Terms of Service, please contact us:
        </p>
        <div className="space-y-2 text-gray-300">
          <p>
            Email:{' '}
            <a href="mailto:legal@artgstore.com" className="text-neon-green hover:underline">
              legal@artgstore.com
            </a>
          </p>
          <p>
            Phone:{' '}
            <a href="tel:+21612345678" className="text-neon-green hover:underline">
              +216 12 345 678
            </a>
          </p>
          <p>Address: Tunis, Tunisia</p>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
