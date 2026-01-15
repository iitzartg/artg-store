import { Gamepad2, Gift, Shield, Zap, Users, Award } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <section className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="neon-text">About ArtG Store</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Your trusted destination for digital games and gift cards
        </p>
      </section>

      {/* Mission */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          At ArtG Store, we're passionate about bringing the best digital gaming experience to players
          across Tunisia and beyond. Our mission is to provide instant access to the latest games,
          exclusive deals, and premium gift cards with unmatched convenience and security.
        </p>
        <p className="text-gray-300 leading-relaxed">
          We believe that gaming should be accessible, affordable, and enjoyable for everyone. That's
          why we've built a platform that combines cutting-edge technology with exceptional customer
          service to deliver a seamless shopping experience.
        </p>
      </section>

      {/* Values */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Our Values</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Delivery</h3>
            <p className="text-gray-400">
              No waiting, no delays. Get your digital products instantly after purchase.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Security First</h3>
            <p className="text-gray-400">
              Your data and transactions are protected with industry-leading security measures.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-red-600 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Customer Focus</h3>
            <p className="text-gray-400">
              Your satisfaction is our priority. We're here to help whenever you need us.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Gaming Passion</h3>
            <p className="text-gray-400">
              We're gamers too, and we understand what you're looking for in a gaming store.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
            <p className="text-gray-400">
              Only authentic, verified digital keys and gift cards from trusted sources.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
            <p className="text-gray-400">
              Competitive pricing with regular deals and promotions for our customers.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Our Story</h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            ArtG Store was founded with a simple vision: to make digital gaming accessible and
            convenient for everyone. Starting as a small team of gaming enthusiasts in Tunisia, we
            recognized the challenges gamers faced when trying to purchase digital games and gift
            cards.
          </p>
          <p>
            We set out to create a platform that eliminates the hassle of traditional purchasing
            methods. No more waiting for physical shipments, dealing with region restrictions, or
            worrying about product authenticity. With ArtG Store, you get instant access to your
            favorite games and gift cards with just a few clicks.
          </p>
          <p>
            Today, we're proud to serve thousands of customers across the region, offering a
            curated selection of the best digital games and gift cards. Our commitment to
            excellence drives us to continuously improve our platform and expand our product
            catalog.
          </p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Why Choose ArtG Store?</h2>
        <ul className="space-y-3 text-gray-300">
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">✓</span>
            <span>Instant digital delivery - no shipping required</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">✓</span>
            <span>100% authentic products with full warranty</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">✓</span>
            <span>Secure payment processing with encryption</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">✓</span>
            <span>24/7 customer support ready to help</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">✓</span>
            <span>Competitive prices and regular promotions</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-neon-green mt-1">✓</span>
            <span>Wide selection of games and gift cards</span>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default AboutUs;
