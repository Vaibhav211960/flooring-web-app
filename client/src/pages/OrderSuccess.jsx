import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, Package, Truck, 
  Home, ShoppingBag, MapPin, User, Volume2, VolumeX, Download
} from "lucide-react";
import { Button } from "../ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { order } = location.state || {};
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!order) {
      navigate("/");
    }
  }, [order, navigate]);

  // --- Professional Invoice Logic ---
  const generateInvoice = () => {
    try {
      setIsGenerating(true);
      const doc = new jsPDF();
      const date = new Date(order.orderDate || Date.now()).toLocaleDateString('en-IN');
      
      // 1. Branding Header
      doc.setFillColor(28, 25, 23); 
      doc.rect(0, 0, 210, 40, 'F'); 
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("Inscape Layers", 14, 25);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(160, 160, 160);
      doc.text(`REFERENCE ID: ${order._id.toUpperCase()}`, 14, 32);

      // 2. Billing & Shipping Details
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("BILL TO (CUSTOMER):", 14, 55);
      doc.setFont("helvetica", "normal");
      doc.text([
        order.shippingAddress.fullName.toUpperCase(),
        `Phone: ${order.shippingAddress.contact}`,
        `Order Date: ${date}`,
      ], 14, 62);

      doc.setFont("helvetica", "bold");
      doc.text("SHIP TO (PROJECT SITE):", 120, 55);
      doc.setFont("helvetica", "normal");
      const addressLines = doc.splitTextToSize(order.shippingAddress.address, 70);
      doc.text(addressLines, 120, 62);
      doc.text([
        `Pincode: ${order.shippingAddress.pincode}`
      ], 120, 62 + (addressLines.length * 5));

      // 3. Table
      const tableRows = order.items.map((item, index) => [
        index + 1,
        item.productName.toUpperCase(),
        item.units,
        `INR ${Number(item.pricePerUnit).toLocaleString('en-IN')}`,
        `INR ${Number(item.totalAmount).toLocaleString('en-IN')}`
      ]);

      autoTable(doc, {
        startY: 95,
        head: [["SR.", "DESCRIPTION", "QTY", "RATE", "AMOUNT"]],
        body: tableRows,
        theme: "grid",
        headStyles: { fillColor: [28, 25, 23], textColor: [255, 255, 255], fontSize: 9 },
        columnStyles: { 0: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' } }
      });

      // 4. Financial Summary
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFillColor(245, 245, 245);
      doc.rect(120, finalY - 5, 76, 20, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("GRAND TOTAL:", 125, finalY + 7);
      doc.setTextColor(180, 83, 9);
      doc.text(`INR ${Number(order.netBill).toLocaleString('en-IN')}`, 190, finalY + 7, { align: 'right' });

      // 5. Footer
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text("This is a system-generated document for the transaction secured on our platform.", 105, 285, { align: 'center' });

      doc.save(`Invoice_${order._id.slice(-6)}.pdf`);
    } catch (error) {
      console.error("PDF Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const speakOrderSummary = () => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const message = `Thank you, ${order.shippingAddress.fullName}. Your order is confirmed. The total of ${order.netBill} rupees is secured.`;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  if (!order) return null;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <main className="flex-grow pt-24 pb-20">
        <div className="container max-w-5xl mx-auto px-6">
          
          <div className="flex flex-col items-center text-center mb-16">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100 relative">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              <button 
                onClick={speakOrderSummary}
                className="absolute -right-12 bottom-0 p-3 bg-white border border-stone-200 rounded-full shadow-sm hover:text-amber-600 transition-colors"
              >
                {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
            <h1 className="text-5xl font-serif font-bold tracking-tight">Purchase <span className="italic text-amber-600">Complete</span></h1>
            <p className="mt-4 text-stone-500 font-serif italic">Your premium materials have been secured successfully.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 bg-stone-900 text-white flex justify-between items-center">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400">Order Reference</p>
                    <p className="font-mono text-lg font-bold">{order._id.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400">Status</p>
                    <p className="text-sm font-mono text-amber-500 font-bold">CONFIRMED</p>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="font-serif font-bold text-lg mb-6 flex items-center gap-2">
                    <Package size={18} className="text-amber-600" /> Itemized Manifest
                  </h3>
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3 border-b border-stone-50 last:border-0">
                        <div>
                          <p className="text-sm font-bold text-stone-800">{item.productName}</p>
                          <p className="text-[10px] text-stone-400 uppercase tracking-widest">{item.units} Units</p>
                        </div>
                        <p className="font-mono font-bold text-stone-900">₹{item.totalAmount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-stone-200 flex justify-between items-end">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Total Paid</p>
                    <p className="text-4xl font-mono font-bold text-amber-800 tracking-tighter">₹{order.netBill.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
                <h3 className="font-serif font-bold text-lg mb-6 border-b border-stone-100 pb-4 text-stone-800">Dispatch Detail</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <User size={18} className="text-stone-300 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Consignee</p>
                      <p className="text-sm font-bold text-stone-800">{order.shippingAddress.fullName}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <MapPin size={18} className="text-stone-300 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Destination</p>
                      <p className="text-sm text-stone-600 leading-relaxed italic">{order.shippingAddress.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={generateInvoice}
                  disabled={isGenerating}
                  className="bg-amber-600 hover:bg-amber-700 text-white h-14 rounded-xl font-bold uppercase tracking-widest text-[9px] flex gap-2"
                >
                  <Download size={16} /> {isGenerating ? "Preparing PDF..." : "Download Digital Invoice"}
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => window.print()}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-900 h-12 rounded-xl font-bold uppercase tracking-widest text-[9px]"
                  >
                    Quick Print
                  </Button>
                  <Button 
                    onClick={() => navigate("/")}
                    className="bg-stone-900 text-white h-12 rounded-xl font-bold uppercase tracking-widest text-[9px]"
                  >
                    Return Home
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}