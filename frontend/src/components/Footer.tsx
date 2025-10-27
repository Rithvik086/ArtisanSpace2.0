
const Footer = ({ role = "guest" }) => {
  return (
    <footer className="font-['Baloo_Bhai_2',sans-serif] mt-auto">
      <div className="bg-[#f8ead8] text-black w-full flex justify-evenly items-start py-10 flex-wrap">
        {/* Footer Section 1 */}
        <div className="max-w-[350px] flex flex-col gap-2.5 items-center">
          <p className="font-['Kranky','Baloo_Bhai_2',sans-serif] font-bold text-[40px]">
            AS
          </p>
          <p className="w-[260px] text-base my-1.5">
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout.
          </p>
        </div>

        {/* Help Section */}
        <div className="flex flex-col gap-2.5 text-base">
          <p className="text-[#5c4033] font-bold text-2xl">Help</p>
          <a href="/aboutus" className="no-underline text-black">
            <p className="my-1.5">AboutUs</p>
          </a>
          {(role === "customer" || role === "artisan") && (
            <>
              <a href="/contactus" className="no-underline text-black">
                <p className="my-1.5">Contact</p>
              </a>
              <a href="/supportTicket" className="no-underline text-black">
                <p className="my-1.5">Support Ticket</p>
              </a>
            </>
          )}
        </div>

        {/* Our Information Section */}
        <div className="flex flex-col gap-2.5 text-base">
          <p className="text-[#5c4033] font-bold text-2xl">Our Information</p>
          <p className="my-1.5">IIIT SriCity</p>
          <p className="my-1.5">+91 0000000000</p>
          <p className="my-1.5">Artisanspace09@gmail.com</p>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="text-center text-white w-full bg-[#5c4033] py-5">
        Copyright &copy; 2025 All Rights Reserved by ArtisanSpace
      </div>
    </footer>
  );
};

export default Footer;