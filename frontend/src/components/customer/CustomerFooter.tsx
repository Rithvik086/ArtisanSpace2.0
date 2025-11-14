export default function CustomerFooter() {
  return (
    <footer className="bg-white text-amber-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Help Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Help</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-amber-900 hover:text-amber-950 transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-amber-900 hover:text-amber-950 transition-colors"
                >
                  Shipping Info
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-amber-900 hover:text-amber-950 transition-colors"
                >
                  Returns
                </a>
              </li>
            </ul>
          </div>

          {/* About Us Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">About Us</h3>
            <p className="text-amber-900 text-base leading-relaxed">
              ArtisanSpace connects skilled artisans with customers who
              appreciate handmade craftsmanship. Discover unique pieces that
              tell a story.
            </p>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-amber-900">
              <li>
                <a
                  href="mailto:Artisanspace09@gmail.com"
                  className="hover:text-amber-950 transition-colors"
                >
                  Artisanspace09@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+910000000000"
                  className="hover:text-amber-950 transition-colors"
                >
                  +91 0000000000
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Info Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Support Ticket</h3>
            <p className="text-amber-900 text-base mb-4">
              Need help? Create a support ticket and we'll get back to you.
            </p>
            <a
              href="#"
              className="inline-block bg-amber-950 text-amber-50 px-4 py-2 rounded-md hover:bg-amber-900 transition-colors"
            >
              Create Ticket
            </a>

            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2">Our Information</h4>
              <p className="text-amber-900 text-base">
                IIIT SriCity
                <br />
                +91 0000000000
                <br />
                Artisanspace09@gmail.com
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-amber-200 mt-8 pt-8 text-center">
          <p className="text-amber-900 text-base">
            © 2025 ArtisanSpace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
