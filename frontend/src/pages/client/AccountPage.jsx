import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import api from "../../utils/axios";

const TABS = ["Booking History", "Payments", "User Details"];

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [karaokeBookings, setKaraokeBookings] = useState([]);
  const [n64Bookings, setN64Bookings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [karaokeRes, n64Res, userRes] = await Promise.all([
          api.get("/karaoke-rooms/my-bookings"),
          api.get("/n64-rooms/my-bookings"),
          api.get("/user/profile"),
        ]);
        // Handle both array and single object for karaoke bookings
        if (Array.isArray(karaokeRes.data.bookings)) {
          setKaraokeBookings(karaokeRes.data.bookings);
        } else if (karaokeRes.data.booking) {
          setKaraokeBookings([karaokeRes.data.booking]);
        } else {
          setKaraokeBookings([]);
        }
        // Handle both array and single object for n64 bookings
        if (Array.isArray(n64Res.data.bookings)) {
          setN64Bookings(n64Res.data.bookings);
        } else if (n64Res.data.booking) {
          setN64Bookings([n64Res.data.booking]);
        } else {
          setN64Bookings([]);
        }
        setUser(userRes.data.user || null);
      } catch (err) {
        setError("Failed to fetch account data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="flex-grow w-full max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-pink-500">My Account</h1>
        {/* Tabs */}
        <div className="flex border-b mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`px-6 py-2 font-semibold focus:outline-none transition-colors duration-200 border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-pink-500 text-pink-500"
                  : "border-transparent text-gray-400 hover:text-pink-400"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Tab Content */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">Loading...</div>
        ) : error ? (
          <div className="flex justify-center items-center min-h-[200px] text-red-500">{error}</div>
        ) : (
          <>
            {activeTab === "Booking History" && (
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-200">Karaoke Bookings</h2>
                {karaokeBookings.length === 0 ? (
                  <p className="mb-4 text-gray-400">No karaoke bookings found.</p>
                ) : (
                  <ul className="mb-6">
                    {karaokeBookings.map((b) => (
                      <li key={b._id} className="mb-2 p-3 border rounded-lg bg-gray-900">
                        <div><span className="font-semibold">Date:</span> {b.date}</div>
                        <div><span className="font-semibold">Time:</span> {b.time}</div>
                        <div><span className="font-semibold">Room:</span> {b.roomId?.name || b.roomId}</div>
                        <div><span className="font-semibold">Status:</span> {b.status}</div>
                        <div><span className="font-semibold">Payment:</span> {b.paymentStatus}</div>
                      </li>
                    ))}
                  </ul>
                )}
                <h2 className="text-xl font-semibold mb-2 text-gray-200">N64 Bookings</h2>
                {n64Bookings.length === 0 ? (
                  <p className="text-gray-400">No N64 bookings found.</p>
                ) : (
                  <ul>
                    {n64Bookings.map((b) => (
                      <li key={b._id} className="mb-2 p-3 border rounded-lg bg-gray-900">
                        <div><span className="font-semibold">Date:</span> {b.date}</div>
                        <div><span className="font-semibold">Time:</span> {b.time}</div>
                        <div><span className="font-semibold">Room:</span> {b.roomId?.name || b.roomType || b.roomId}</div>
                        <div><span className="font-semibold">Status:</span> {b.status}</div>
                        <div><span className="font-semibold">Payment:</span> {b.paymentStatus}</div>
                        {b.staffName && (
                          <div><span className="font-semibold">Staff Name:</span> {b.staffName}</div>
                        )}
                        {b.staffPin && (
                          <div><span className="font-semibold">Staff Pin:</span> {b.staffPin}</div>
                        )}
                        {typeof b.isManualBooking !== 'undefined' && (
                          <div><span className="font-semibold">Manual Booking:</span> {b.isManualBooking ? 'Yes' : 'No'}</div>
                        )}
                        {b.roomId?.inclusions && (
                          <div className="mt-2">
                            <span className="font-semibold">Inclusions:</span>
                            <ul className="list-disc list-inside ml-4">
                              {b.roomId.inclusions.features?.map((feature, idx) => (
                                <li key={idx}>{feature}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {activeTab === "Payments" && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-200">Payments</h2>
                <p className="text-gray-400">Payment history and details will be shown here soon.</p>
              </div>
            )}
            {activeTab === "User Details" && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-200">User Details</h2>
                {user ? (
                  <div className="space-y-2">
                    <div><span className="font-semibold">Name:</span> {user.name}</div>
                    <div><span className="font-semibold">Email:</span> {user.email}</div>
                    {user.phone && <div><span className="font-semibold">Phone:</span> {user.phone}</div>}
                    {user.dob && <div><span className="font-semibold">Date of Birth:</span> {user.dob}</div>}
                  </div>
                ) : (
                  <p className="text-gray-400">No user details found.</p>
                )}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AccountPage;
