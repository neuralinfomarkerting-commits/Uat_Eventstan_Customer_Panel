"use client";

const SECTIONS = [
  {
    heading: "Security",
    body: `Personal Information will be kept confidential, and we do not disclose the information except that in case you have specifically made an enquiry. Further, the vendors / advertisers who are listed with us, may call you, based on the query or enquiry that you make with us, enquiring about any Product / Service they might offer. We will share Personal Information only under one or more of the following circumstances: if we have your consent or deemed consent to do so, or if we are compelled by law (including court orders) to do so. In furtherance of the confidentiality with which we treat Personal Information we have put in place appropriate physical, electronic, and managerial procedures to safeguard and secure the information we collect online. We give you the ability to edit your account information and preferences at any time, including whether you want us to contact you regarding any services. To protect your privacy and security, we will also take reasonable steps to verify your identity before granting access or making corrections. We treat data as an asset that must be protected against loss and unauthorized access. We employ many different security techniques to protect such data from unauthorized access by members inside and outside the company. However, "perfect security" does not exist on the Internet, or anywhere else in the world! You therefore agree that any security breaches beyond the control of our standard security procedures are at your sole risk and discretion.`,
  },
  {
    heading: "Links to other Websites",
    body: `We have affiliate links to many other online resources. We are not responsible for the practices employed by these affiliates, or their websites linked to or from Eventstan.com nor the information or content contained on these third-party websites. You should carefully review their privacy statements and other conditions of use and you agree you provide information or engage in transactions with these affiliates at your own risk.`,
  },
  {
    heading: "Control Of Your Password",
    body: `You are responsible for all actions taken with your login information and password, including fees. Therefore, we do not recommend that you disclose your account password or login information to any third parties. If you lose control of your password, you may lose substantial control over your personally identifiable information and may be subject to legally binding actions taken on your behalf. Therefore, if your password has been compromised for any reason, you should immediately change your password.`,
  },
  {
    heading: "Content On the Site",
    body: `Eventstan.com features some of the latest trends in UAE events around the world and tries to give its users exposure to quality hand-picked content. We also feature events and articles where users have given us permission to use the same. However, in the unlikely event of anyone having any objection to content put up on our site, they are free to contact us immediately and we will be happy to consider their request and take necessary action.`,
  },
  {
    heading: "Updates on Privacy Policy",
    body: `We reserve the right to revise these Privacy Policies of Eventstan.com from time to time by updating this posting. Such revised policies will take effect as of the date of posting.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-500 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Legal
        </span>
        <h1 className="text-4xl font-bold text-gray-900 mb-1">
          Privacy Policy
        </h1>
        <p className="text-gray-500">
          How we collect, use, and protect your information.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10 space-y-8">
        <div className="space-y-4 text-sm leading-relaxed text-gray-600">
          <p>
            Our management has created this Privacy Statement (Policy) in order
            to demonstrate our firm commitment to help our users better
            understand what information we collect about them and what may
            happen to that information.
          </p>
          <p>
            The terms &quot;We, Eventstan, Us&quot; refer to Eventstan.com and
            the terms &quot;You, Your&quot; refer to a user of Eventstan.com. In
            the course of our business of helping our viewers plan their event,
            we collect certain information from you. While registering for and
            availing various services we provide from time to time through our
            website: In Eventstan, you may be required to give your Name,
            address, Email address, phone number. The Personal Information is
            used for three general purposes: to customize the content you see,
            to fulfill your requests for certain services, and to contact you
            about our services. Unless otherwise stated explicitly, this Policy
            applies to Personal Information as disclosed on any of the Media.
            Dear Users, the Data we collect and use is upon your consent and
            none of our activities amount to breach of compliance. We value your
            security and privacy and are doing our best to ensure security of
            the data you provide to us in any manner whatsoever. We acknowledge
            your consent for providing such data to us for smooth execution of
            our services and note your acceptance to providing us with all
            information so collected, including Name, Gender, Email, Contact
            Number, Age, Location, Device Details, Browsing Information, SMS,
            App Install and Usage, Preferences, Intent etc.
          </p>
        </div>

        {SECTIONS.map((section, idx) => (
          <div key={idx} className="border-t border-gray-100 pt-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
              <span className="w-1.5 h-5 rounded-full bg-orange-500 inline-block" />
              {section.heading}
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">
              {section.body}
            </p>
          </div>
        ))}

        {/* Contact card */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
            <span className="w-1.5 h-5 rounded-full bg-orange-500 inline-block" />
            Contact Us
          </h2>
          <div className="bg-orange-50 rounded-xl px-4 py-4 text-sm text-gray-700">
            <p className="mb-2">
              If you have any further queries regarding the privacy policy, feel
              free to contact us at{" "}
              <a
                href="mailto:info@eventstan.com"
                className="text-orange-500 font-semibold hover:underline"
              >
                info@eventstan.com
              </a>
            </p>
            <p className="text-gray-500">
              EventStan – Your Personal Event Planner
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
