import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <section className="text-center py-8">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="neon-text">Privacy Policy</span>
        </h1>
        <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
      </section>

      {/* Introduction */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Introduction</h2>
        <p className="text-gray-300 leading-relaxed">
          At ArtG Store, we are committed to protecting your privacy and ensuring the security of your
          personal information. This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you visit our website and use our services.
        </p>
        <p className="text-gray-300 leading-relaxed mt-4">
          By using our website, you consent to the data practices described in this policy. If you
          do not agree with the practices described, please do not use our services.
        </p>
      </section>

      {/* Information We Collect */}
      <section className="card">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="w-6 h-6 text-neon-green" />
          <h2 className="text-2xl font-bold">Information We Collect</h2>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
            <p className="text-gray-300 leading-relaxed">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300 ml-4">
              <li>Name and contact information (email address, phone number)</li>
              <li>Account credentials (username, password)</li>
              <li>Payment information (processed securely through third-party providers)</li>
              <li>Billing and shipping addresses</li>
              <li>Purchase history and preferences</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Automatically Collected Information</h3>
            <p className="text-gray-300 leading-relaxed">
              When you visit our website, we automatically collect certain information:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300 ml-4">
              <li>IP address and browser type</li>
              <li>Device information and operating system</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How We Use Information */}
      <section className="card">
        <div className="flex items-center space-x-3 mb-4">
          <Eye className="w-6 h-6 text-neon-blue" />
          <h2 className="text-2xl font-bold">How We Use Your Information</h2>
        </div>
        <p className="text-gray-300 leading-relaxed mb-4">
          We use the information we collect for various purposes:
        </p>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>To process and fulfill your orders</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>To communicate with you about your orders and account</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>To provide customer support and respond to inquiries</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>To improve our website and services</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>To send promotional emails (with your consent)</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>To detect and prevent fraud and abuse</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>To comply with legal obligations</span>
          </li>
        </ul>
      </section>

      {/* Data Security */}
      <section className="card">
        <div className="flex items-center space-x-3 mb-4">
          <Lock className="w-6 h-6 text-neon-purple" />
          <h2 className="text-2xl font-bold">Data Security</h2>
        </div>
        <p className="text-gray-300 leading-relaxed mb-4">
          We implement appropriate technical and organizational security measures to protect your
          personal information:
        </p>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Encryption of data in transit and at rest</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Secure payment processing through trusted providers</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Regular security audits and updates</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Limited access to personal information on a need-to-know basis</span>
          </li>
        </ul>
        <p className="text-gray-300 leading-relaxed mt-4">
          However, no method of transmission over the Internet or electronic storage is 100% secure.
          While we strive to use commercially acceptable means to protect your information, we cannot
          guarantee absolute security.
        </p>
      </section>

      {/* Cookies */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Cookies and Tracking Technologies</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          We use cookies and similar tracking technologies to enhance your browsing experience,
          analyze site traffic, and personalize content. You can control cookies through your
          browser settings, but disabling cookies may limit some functionality of our website.
        </p>
        <p className="text-gray-300 leading-relaxed">
          Types of cookies we use:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300 ml-4">
          <li>Essential cookies: Required for basic website functionality</li>
          <li>Analytics cookies: Help us understand how visitors use our site</li>
          <li>Preference cookies: Remember your settings and preferences</li>
          <li>Marketing cookies: Used to deliver relevant advertisements</li>
        </ul>
      </section>

      {/* Third-Party Services */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Third-Party Services</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          We may share your information with trusted third-party service providers who assist us in
          operating our website, conducting business, or serving our users:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
          <li>Payment processors for transaction processing</li>
          <li>Email service providers for communications</li>
          <li>Analytics providers for website usage analysis</li>
          <li>Cloud hosting providers for data storage</li>
        </ul>
        <p className="text-gray-300 leading-relaxed mt-4">
          These third parties are contractually obligated to protect your information and use it
          only for the purposes we specify.
        </p>
      </section>

      {/* Your Rights */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          You have the following rights regarding your personal information:
        </p>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Access: Request a copy of your personal data</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Correction: Request correction of inaccurate information</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Deletion: Request deletion of your personal data</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Objection: Object to processing of your data</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Portability: Request transfer of your data</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">•</span>
            <span>Withdraw consent: Withdraw consent for data processing</span>
          </li>
        </ul>
        <p className="text-gray-300 leading-relaxed mt-4">
          To exercise these rights, please contact us at{' '}
          <a href="mailto:privacy@artgstore.com" className="text-neon-green hover:underline">
            privacy@artgstore.com
          </a>
        </p>
      </section>

      {/* Children's Privacy */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
        <p className="text-gray-300 leading-relaxed">
          Our services are not intended for individuals under the age of 18. We do not knowingly
          collect personal information from children. If you believe we have collected information
          from a child, please contact us immediately, and we will take steps to delete such
          information.
        </p>
      </section>

      {/* Changes to Policy */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
        <p className="text-gray-300 leading-relaxed">
          We may update this Privacy Policy from time to time. We will notify you of any changes by
          posting the new policy on this page and updating the "Last updated" date. You are advised
          to review this policy periodically for any changes.
        </p>
      </section>

      {/* Contact */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          If you have any questions about this Privacy Policy, please contact us:
        </p>
        <div className="space-y-2 text-gray-300">
          <p>
            Email:{' '}
            <a href="mailto:privacy@artgstore.com" className="text-neon-green hover:underline">
              privacy@artgstore.com
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

export default PrivacyPolicy;
