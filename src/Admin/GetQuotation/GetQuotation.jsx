import { useEffect, useMemo, useState } from "react";
import "./GetQuotation.css";
import html2pdf from "html2pdf.js";
import { useNavigate } from "react-router-dom";
import api from "../../Utils/api";
import { IMAGE_FILE_ACCEPT, optimizeImageFile, resolveAssetUrl, validateImageFile } from "../../Utils/fileUpload";

const COMPANY = {
  name: "Starry Nights Holidays",
  legalName: "Starry Nights Tours and Adventures",
  address: "004, Starry Nights, Nanded - 431603",
  puneOffice: "Shivam Plaza, Kothrud, Pune",
  phone: "+91 8847755042",
  alternatePhone: "+91 9284137430",
  email: "travelwithstarrynights@gmail.com",
  website: "www.starrynightsindia.in"
};

const DEFAULT_FORM = {
  locations: "",
  pickup: "",
  rooms: "",
  persons: "",
  meal: "",
  currency: "INR",
  travelAdvisory: "",
  classicHotel: "",
  signatureHotel: "",
  eliteHotel: "",
  classicPrice: "",
  signaturePrice: "",
  elitePrice: "",
  includes: "",
  excludes: "",
  firstPageCount: "3",
  otherPageCount: "5",
  itineraryDays: "",
  employeeName: "",
  customerEmail: ""
};

const HOTEL_TIERS = ["classic", "signature", "elite"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const today = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

const lines = (value = "") => value.split("\n").map((item) => item.trim()).filter(Boolean);

const formatPrice = (value, currency) => {
  const cleanValue = String(value || "").trim();
  if (!cleanValue) return `${currency} -`;
  return `${currency} ${cleanValue}`;
};

const flattenCategories = (items = [], parent = null) =>
  items.flatMap((item) => {
    const code = item.code || item.categoryCode;
    const node = {
      code,
      parent: parent || item.parent,
      name: item.name || item.categoryName || item.title
    };
    return [node, ...flattenCategories(item.children || [], code)];
  });

const resolveTemplate = (categoryCodes = [], categoryLookup) => {
  const codes = categoryCodes.map((code) => String(code || "").toUpperCase()).filter(Boolean);
  const hasAncestor = (code, target) => {
    let current = code;
    while (current) {
      if (current === target) return true;
      current = categoryLookup.get(current)?.parent?.toUpperCase();
    }
    return false;
  };

  if (codes.some((code) => code === "INT" || code.startsWith("INT-") || hasAncestor(code, "INT"))) {
    return "international";
  }
  return "domestic";
};

const splitItinerary = (itinerary = [], firstCount = 3, otherCount = 5) => {
  if (!Array.isArray(itinerary) || itinerary.length === 0) return [[]];
  const pages = [itinerary.slice(0, firstCount)];
  let remaining = itinerary.slice(firstCount);

  while (remaining.length > 0) {
    pages.push(remaining.slice(0, otherCount));
    remaining = remaining.slice(otherCount);
  }

  return pages;
};

const normalizeItinerary = (items = [], count = 0) => {
  const source = Array.isArray(items) ? items : [];
  const targetCount = Math.max(1, Number(count) || source.length || 1);

  return Array.from({ length: targetCount }, (_, index) => {
    const existing = source[index] || {};
    const day = index + 1;
    return {
      ...existing,
      day,
      dayNumber: day,
      title: existing.title || `Day ${day}`,
      desc: existing.desc || existing.description || "",
      description: existing.description || existing.desc || "",
      imageUrls: Array.isArray(existing.imageUrls)
        ? existing.imageUrls
        : Array.isArray(existing.images)
        ? existing.images
        : []
    };
  });
};

const normalizeHotelImages = (images = {}) => Object.fromEntries(
  HOTEL_TIERS.map((tier) => [tier, images?.[tier] || null])
);

function QuoteImagePicker({ image, label, onSelect, onRemove }) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return undefined;
    }
    if (typeof image === "string") {
      setPreviewUrl(resolveAssetUrl(image));
      return undefined;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const handleSelection = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      validateImageFile(file);
      onSelect(await optimizeImageFile(file));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="quote-image-picker">
      {previewUrl ? <img src={previewUrl} alt={label} /> : <span>{label}</span>}
      <input type="file" accept={IMAGE_FILE_ACCEPT} aria-label={`Upload ${label}`} onChange={handleSelection} />
      {previewUrl && <button type="button" onClick={onRemove} aria-label={`Remove ${label}`}>x</button>}
    </div>
  );
}

function QuotePdfImage({ image, alt }) {
  const [source, setSource] = useState("");

  useEffect(() => {
    if (!image) {
      setSource("");
      return undefined;
    }
    if (typeof image === "string") {
      setSource(resolveAssetUrl(image));
      return undefined;
    }

    const objectUrl = URL.createObjectURL(image);
    setSource(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  return source ? <img src={source} alt={alt} crossOrigin="anonymous" /> : null;
}

function QuoteFooter({ page, total }) {
  return (
    <footer className="quote-footer">
      <div>
        <strong>{COMPANY.name}</strong>
        <span>{COMPANY.phone} | {COMPANY.email}</span>
      </div>
      <div>
        <span>{COMPANY.website}</span>
        <strong>Page {page} of {total}</strong>
      </div>
    </footer>
  );
}

function QuoteHeader({ template, title }) {
  return (
    <header className="quote-header">
      <img src="/Starry Nights Holidays.png" className="quote-logo" alt="Starry Nights Holidays" />
      <div>
        <span className="quote-eyebrow">
          {template === "international" ? "International Tour Quotation" : "Domestic Tour Quotation"}
        </span>
        <h1>{COMPANY.name}</h1>
        <p>{COMPANY.address} | {COMPANY.puneOffice}</p>
        <p>{COMPANY.phone} | {COMPANY.website}</p>
      </div>
      <div className="quote-doc-card">
        <span>Prepared On</span>
        <strong>{today}</strong>
        <small>{title}</small>
      </div>
    </header>
  );
}

function InfoGrid({ data, form }) {
  return (
    <div className="quote-info-grid">
      <p><span>Tour</span><strong>{data.heroTitle}</strong></p>
      <p><span>Locations</span><strong>{form.locations || "-"}</strong></p>
      <p><span>Pickup - Drop</span><strong>{form.pickup || "-"}</strong></p>
      <p><span>Rooms</span><strong>{form.rooms || "-"}</strong></p>
      <p><span>Total Persons</span><strong>{form.persons || "-"}</strong></p>
      <p><span>Meal Plan</span><strong>{form.meal || "-"}</strong></p>
      <p><span>Duration</span><strong>{data.days ? `${data.days} Days` : "-"}</strong></p>
      <p><span>Currency</span><strong>{form.currency}</strong></p>
    </div>
  );
}

function PricingBlock({ form, isInternational }) {
  const label = isInternational ? "International Collection" : "Domestic Collection";
  return (
    <div className="quote-pricing-grid">
      <div>
        <span>Classic {label}</span>
        <strong>{formatPrice(form.classicPrice, form.currency)}</strong>
      </div>
      <div>
        <span>Signature {label}</span>
        <strong>{formatPrice(form.signaturePrice, form.currency)}</strong>
      </div>
      <div>
        <span>Elite {label}</span>
        <strong>{formatPrice(form.elitePrice, form.currency)}</strong>
      </div>
    </div>
  );
}

export default function GetQuotation() {
  const [pkgId, setPkgId] = useState("");
  const [data, setData] = useState(null);
  const [categoryTree, setCategoryTree] = useState([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [quoteItinerary, setQuoteItinerary] = useState([]);
  const [hotelImages, setHotelImages] = useState(() => normalizeHotelImages());
  const [emailStatus, setEmailStatus] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/categories/tree").then(setCategoryTree).catch(() => setCategoryTree([]));
  }, []);

  const categoryLookup = useMemo(() => {
    return new Map(flattenCategories(categoryTree).map((item) => [String(item.code || "").toUpperCase(), item]));
  }, [categoryTree]);

  const fetchPackage = async () => {
    try {
      const json = await api.get(`/packages/${pkgId}`);
      const categoryCodes = Array.isArray(json.categoryCodes) ? json.categoryCodes : [];
      const template = resolveTemplate(categoryCodes, categoryLookup);
      const includes = Array.isArray(json.inclusions) ? json.inclusions.join("\n") : json.includes || "";
      const excludes = Array.isArray(json.exclusions) ? json.exclusions.join("\n") : json.excludes || "";
      const defaultCurrency = template === "international" ? "USD" : "INR";
      const sourceItinerary = Array.isArray(json.itinerary) ? json.itinerary : [];
      const dayCount = Number(json.days) || sourceItinerary.length || 1;
      const editableItinerary = normalizeItinerary(sourceItinerary, dayCount);

      setData({
        packageCode: json.packageCode || json.code || pkgId,
        heroTitle: json.heroTitle || json.title || json.name || pkgId,
        overview: json.overview || "",
        itinerary: editableItinerary,
        categoryCodes,
        template,
        days: dayCount,
        info: json.info || {}
      });
      setQuoteItinerary(editableItinerary);
      setHotelImages(normalizeHotelImages(json.quotationHotelImages));
      setEmailStatus(null);

      setForm((prev) => ({
        ...prev,
        currency: prev.currency && prev.currency !== DEFAULT_FORM.currency ? prev.currency : defaultCurrency,
        locations: prev.locations || json.region || json.info?.pickup || "",
        pickup: prev.pickup || json.info?.pickup || "",
        itineraryDays: String(dayCount),
        includes,
        excludes,
        travelAdvisory: prev.travelAdvisory || "Passport, visa, insurance, airline baggage, and destination entry rules are subject to official updates."
      }));
    } catch (err) {
      alert("Package not found");
    }
  };

  const updateItineraryCount = (value) => {
    setForm((prev) => ({ ...prev, itineraryDays: value }));
    const count = Number(value);
    if (!Number.isInteger(count) || count < 1) return;
    setQuoteItinerary((prev) => normalizeItinerary(prev, count));
  };

  const updateItineraryDay = (index, field, value) => {
    setQuoteItinerary((prev) => prev.map((day, itemIndex) => {
      if (itemIndex !== index) {
        return day;
      }
      const updated = { ...day, [field]: value };
      if (field === "desc") {
        updated.description = value;
      }
      if (field === "description") {
        updated.desc = value;
      }
      return updated;
    }));
  };

  const updateItineraryImage = (dayIndex, imageIndex, image) => {
    setQuoteItinerary((prev) => prev.map((day, index) => {
      if (index !== dayIndex) return day;
      const imageUrls = [...(day.imageUrls || [])];
      imageUrls[imageIndex] = image;
      return { ...day, imageUrls };
    }));
  };

  const removeItineraryImage = (dayIndex, imageIndex) => {
    setQuoteItinerary((prev) => prev.map((day, index) => {
      if (index !== dayIndex) return day;
      const imageUrls = [...(day.imageUrls || [])];
      imageUrls.splice(imageIndex, 1);
      return { ...day, imageUrls };
    }));
  };

  const itineraryPages = data
    ? splitItinerary(
        quoteItinerary,
        Number(form.firstPageCount) || 3,
        Number(form.otherPageCount) || 5
      )
    : [];

  const isInternational = data?.template === "international";
  const totalPages = data ? itineraryPages.length + (isInternational ? 5 : 4) : 0;

  const buildQuotationPdf = async () => {
    const element = document.getElementById("pdf-content");
    if (!element) {
      throw new Error("Generate a quotation before creating the PDF.");
    }

    // Allow file-preview effects to mount their object URLs before collecting PDF images.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await Promise.all([...element.querySelectorAll("img")].map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    }));

    const quotePages = [...element.querySelectorAll(":scope > .page")];
    if (!quotePages.length) {
      throw new Error("Quotation pages are unavailable.");
    }

    const pdfOptions = {
      margin: 0,
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123
      },
      jsPDF: {
        unit: "px",
        format: [794, 1123],
        orientation: "portrait"
      }
    };

    // Each quotation section is already a complete A4 page. Rendering the pages separately
    // avoids html2pdf combining CSS page breaks with its own canvas slicing, which caused
    // an empty page between itinerary pages.
    quotePages.forEach((quotePage) => quotePage.classList.add("is-exporting"));
    try {
      let pdf;

      for (const [pageIndex, quotePage] of quotePages.entries()) {
        const worker = html2pdf().set(pdfOptions).from(quotePage).toCanvas();
        const canvas = await worker.get("canvas");

        if (pageIndex === 0) {
          await worker.toPdf();
          pdf = await worker.get("pdf");
          continue;
        }

        pdf.addPage([794, 1123], "portrait");
        pdf.addImage(
          canvas.toDataURL("image/jpeg", 1),
          "JPEG",
          0,
          0,
          794,
          1123,
          undefined,
          "FAST"
        );
      }

      return {
        pdf,
        filename: `${data?.packageCode || "quotation"}-${data?.template || "tour"}-quotation.pdf`
      };
    } finally {
      quotePages.forEach((quotePage) => quotePage.classList.remove("is-exporting"));
    }
  };

  const downloadPDF = async () => {
    try {
      const { pdf, filename } = await buildQuotationPdf();
      pdf.save(filename);
    } catch (error) {
      setEmailStatus({ type: "error", message: error.message || "Unable to generate the quotation PDF." });
    }
  };

  const sendQuotationEmail = async () => {
    const customerEmail = String(form.customerEmail || "").trim();
    if (!EMAIL_PATTERN.test(customerEmail)) {
      setEmailStatus({ type: "error", message: "Enter a valid customer email address before sending the quotation." });
      return;
    }

    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const { pdf, filename } = await buildQuotationPdf();
      const formData = new FormData();
      formData.append("customerEmail", customerEmail);
      formData.append("packageName", data?.heroTitle || data?.packageCode || "Travel Package");
      formData.append("packageCode", data?.packageCode || pkgId || "quotation");
      formData.append("quotation", pdf.output("blob"), filename);
      await api.post("/quotations/email", formData);
      setEmailStatus({ type: "success", message: `Quotation sent to ${customerEmail}.` });
    } catch (error) {
      setEmailStatus({
        type: "error",
        message: error.response?.data?.message || "Unable to send the quotation email. You can still download the PDF."
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="quotation-container">
      <div className="top-form">
        <div className="quote-form-heading">
          <div>
            <span>Admin PDF Workspace</span>
            <h3>Quotation Builder</h3>
          </div>
          {data && (
            <strong className={`quote-template-pill ${isInternational ? "international" : "domestic"}`}>
              {isInternational ? "International Template" : "Domestic Template"}
            </strong>
          )}
        </div>

        <h4>Employee Details</h4>
        <input
          placeholder="Employee Name"
          value={form.employeeName}
          onChange={(event) => setForm({ ...form, employeeName: event.target.value })}
        />

        <h4>Customer Details</h4>
        <input
          type="email"
          placeholder="Customer Email"
          value={form.customerEmail}
          onChange={(event) => setForm({ ...form, customerEmail: event.target.value })}
        />

        <h4>Package</h4>
        <div className="form-row two">
          <input
            placeholder="Package ID"
            value={pkgId}
            onChange={(event) => setPkgId(event.target.value)}
          />
          <input
            placeholder="Currency"
            value={form.currency}
            onChange={(event) => setForm({ ...form, currency: event.target.value.toUpperCase() })}
          />
        </div>

        <div className="btn-row">
          <button className="fetch-btn" onClick={fetchPackage}>Fetch Package</button>
          <button className="print-btn" onClick={downloadPDF} disabled={!data}>Download PDF</button>
          <button className="quote-email-btn" onClick={sendQuotationEmail} disabled={!data || sendingEmail}>
            {sendingEmail ? "Sending Email..." : "Send by Email"}
          </button>
          <button className="quote-back-btn" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
        </div>
        {emailStatus && (
          <p className={`quote-email-status ${emailStatus.type}`} role={emailStatus.type === "error" ? "alert" : "status"}>
            {emailStatus.message}
          </p>
        )}

        <h4>Itinerary Settings</h4>
        <div className="form-row two">
          <input
            placeholder="First Page Days"
            value={form.firstPageCount}
            onChange={(event) => setForm({ ...form, firstPageCount: event.target.value })}
          />
          <input
            placeholder="Other Pages Days"
            value={form.otherPageCount}
            onChange={(event) => setForm({ ...form, otherPageCount: event.target.value })}
          />
        </div>

        {data && (
          <div className="itinerary-editor">
            <div className="itinerary-editor-header">
              <h4>Editable Itinerary</h4>
              <input
                type="number"
                min="1"
                max="60"
                placeholder="No. of days"
                value={form.itineraryDays}
                onChange={(event) => updateItineraryCount(event.target.value)}
              />
            </div>
            <p className="quotation-media-help">
              Images are included in this quotation preview and downloaded PDF only; they do not change the package.
            </p>

            <div className="itinerary-editor-list">
              {quoteItinerary.map((day, index) => (
                <div className="itinerary-editor-day" key={`quote-day-${index}`}>
                  <strong>Day {index + 1}</strong>
                  <input
                    value={day.title || ""}
                    onChange={(event) => updateItineraryDay(index, "title", event.target.value)}
                    placeholder="Day title"
                  />
                  <textarea
                    value={day.desc || day.description || ""}
                    onChange={(event) => updateItineraryDay(index, "desc", event.target.value)}
                    placeholder="Day description"
                  />
                  <div className="quote-editor-image-grid">
                    {[0, 1, 2].map((imageIndex) => (
                      <QuoteImagePicker
                        key={imageIndex}
                        image={day.imageUrls?.[imageIndex]}
                        label={`Day ${index + 1} image ${imageIndex + 1}`}
                        onSelect={(image) => updateItineraryImage(index, imageIndex, image)}
                        onRemove={() => removeItineraryImage(index, imageIndex)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h4>Basic Details</h4>
        <div className="form-row">
          <input placeholder="Locations" value={form.locations} onChange={(event) => setForm({ ...form, locations: event.target.value })} />
          <input placeholder="Pickup - Drop" value={form.pickup} onChange={(event) => setForm({ ...form, pickup: event.target.value })} />
          <input placeholder="Rooms" value={form.rooms} onChange={(event) => setForm({ ...form, rooms: event.target.value })} />
        </div>
        <div className="form-row two">
          <input placeholder="Total Persons" value={form.persons} onChange={(event) => setForm({ ...form, persons: event.target.value })} />
          <input placeholder="Meal Plan" value={form.meal} onChange={(event) => setForm({ ...form, meal: event.target.value })} />
        </div>

        <h4>Hotel Details</h4>
        <textarea placeholder="Classic Hotel Details" value={form.classicHotel} onChange={(event) => setForm({ ...form, classicHotel: event.target.value })} />
        <textarea placeholder="Signature Hotel Details" value={form.signatureHotel} onChange={(event) => setForm({ ...form, signatureHotel: event.target.value })} />
        <textarea placeholder="Elite Hotel Details" value={form.eliteHotel} onChange={(event) => setForm({ ...form, eliteHotel: event.target.value })} />
        {data && (
          <div className="quote-hotel-image-editor">
            {HOTEL_TIERS.map((tier) => (
              <div key={tier}>
                <strong>{tier} hotel image</strong>
                <QuoteImagePicker
                  image={hotelImages[tier]}
                  label={`${tier} hotel image`}
                  onSelect={(image) => setHotelImages((prev) => ({ ...prev, [tier]: image }))}
                  onRemove={() => setHotelImages((prev) => ({ ...prev, [tier]: null }))}
                />
              </div>
            ))}
          </div>
        )}

        <h4>Pricing</h4>
        <div className="form-row">
          <input placeholder="Classic Price" value={form.classicPrice} onChange={(event) => setForm({ ...form, classicPrice: event.target.value })} />
          <input placeholder="Signature Price" value={form.signaturePrice} onChange={(event) => setForm({ ...form, signaturePrice: event.target.value })} />
          <input placeholder="Elite Price" value={form.elitePrice} onChange={(event) => setForm({ ...form, elitePrice: event.target.value })} />
        </div>

        <h4>Inclusions / Exclusions</h4>
        <textarea placeholder="Includes (one per line)" value={form.includes} onChange={(event) => setForm({ ...form, includes: event.target.value })} />
        <textarea placeholder="Excludes (one per line)" value={form.excludes} onChange={(event) => setForm({ ...form, excludes: event.target.value })} />

        <h4>International Travel Advisory</h4>
        <textarea placeholder="Visa and travel advisory" value={form.travelAdvisory} onChange={(event) => setForm({ ...form, travelAdvisory: event.target.value })} />
      </div>

      {data && (
        <div className={`pdf-wrapper ${isInternational ? "quote-international" : "quote-domestic"}`} id="pdf-content">
          {itineraryPages.map((pageDays, pageIndex) => (
            <div className="page" key={pageIndex}>
              <img src="/Starry Nights Holidays.png" className="quote-watermark" alt="" />

              {pageIndex === 0 && (
                <>
                  <QuoteHeader template={data.template} title={data.heroTitle} />
                  <section className="quote-hero">
                    <span>{isInternational ? "Premium International Journey" : "Curated Indian Journey"}</span>
                    <h2>{data.heroTitle}</h2>
                    <p>
                      {isInternational
                        ? "A polished overseas travel proposal with stay, transfers, inclusions, advisory notes, and multi-currency costing."
                        : "A thoughtfully planned domestic travel proposal with stays, transfers, inclusions, and clear INR costing."}
                    </p>
                  </section>
                  <p className="quote-greeting">
                    Dear Guest, greetings from Starry Nights Holidays. Thank you for allowing us to design
                    your travel experience. Please find the curated itinerary and commercial details below.
                  </p>
                  <InfoGrid data={{ ...data, days: quoteItinerary.length || data.days }} form={form} />
                </>
              )}

              <h3 className="section-title">Detailed Itinerary</h3>
              {pageDays.length ? pageDays.map((day, index) => (
                <div key={`${day.day || index}-${day.title}`} className="day-box">
                  <div className="day-box-heading">
                    <span className="day-box-label">Day {day.day || day.dayNumber || index + 1}</span>
                    <h4>{day.title || "Planned Experience"}</h4>
                  </div>
                  <p>{day.desc || day.description || "Details will be shared by the operations team."}</p>
                  {(day.imageUrls || []).filter(Boolean).length > 0 && (
                    <div className="quote-day-image-grid">
                      {(day.imageUrls || []).filter(Boolean).slice(0, 3).map((image, imageIndex) => (
                        <QuotePdfImage
                          key={`${day.day || index}-image-${imageIndex}`}
                          alt={`Day ${day.day || index + 1}`}
                          image={image}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )) : (
                <div className="day-box">
                  <h4>Itinerary Under Preparation</h4>
                  <p>The detailed day-wise plan will be added once the package itinerary is available.</p>
                </div>
              )}

              <QuoteFooter page={pageIndex + 1} total={totalPages} />
            </div>
          ))}

          <div className="page">
            <img src="/Starry Nights Holidays.png" className="quote-watermark" alt="" />
            <QuoteHeader template={data.template} title={data.heroTitle} />
            <h3 className="section-title">Hotels, Transfers and Costing</h3>
            <div className="hotel-grid">
              {HOTEL_TIERS.map((tier) => (
                <div key={tier}>
                  <strong>{tier}</strong>
                  {hotelImages[tier] && <QuotePdfImage image={hotelImages[tier]} alt={`${tier} hotel`} />}
                  <p>{form[`${tier}Hotel`] || "Hotel details to be confirmed."}</p>
                </div>
              ))}
            </div>
            <PricingBlock form={form} isInternational={isInternational} />
            <div className="quote-note">
              Prices are subject to hotel availability, seasonal changes, transport availability, taxes,
              and final travel dates. Final booking confirmation is subject to payment realization.
            </div>
            <QuoteFooter page={itineraryPages.length + 1} total={totalPages} />
          </div>

          <div className="page">
            <img src="/Starry Nights Holidays.png" className="quote-watermark" alt="" />
            <QuoteHeader template={data.template} title={data.heroTitle} />
            <h3 className="section-title">Package Inclusions</h3>
            <ul className="quote-list">
              {lines(form.includes).length ? lines(form.includes).map((item) => <li key={item}>{item}</li>) : <li>Inclusions will be updated by the sales team.</li>}
            </ul>
            <h3 className="section-title">Package Exclusions</h3>
            <ul className="quote-list">
              {lines(form.excludes).length ? lines(form.excludes).map((item) => <li key={item}>{item}</li>) : <li>Exclusions will be updated by the sales team.</li>}
            </ul>
            <QuoteFooter page={itineraryPages.length + 2} total={totalPages} />
          </div>

          {isInternational && (
            <div className="page">
              <img src="/Starry Nights Holidays.png" className="quote-watermark" alt="" />
              <QuoteHeader template={data.template} title={data.heroTitle} />
              <h3 className="section-title">Visa and Travel Advisory</h3>
              <div className="advisory-grid">
                <div>
                  <strong>Passport and Visa</strong>
                  <p>Passport validity, visa rules, and immigration approval remain subject to destination policy.</p>
                </div>
                <div>
                  <strong>Travel Insurance</strong>
                  <p>International medical and travel insurance is strongly recommended for every traveler.</p>
                </div>
                <div>
                  <strong>Currency and Forex</strong>
                  <p>Package costing may be shown in {form.currency}. INR conversion can vary by bank and payment date.</p>
                </div>
                <div>
                  <strong>Airline and Baggage</strong>
                  <p>Airline schedules, baggage rules, and seat allocation remain subject to airline policy.</p>
                </div>
              </div>
              <p className="quote-note">{form.travelAdvisory}</p>
              <QuoteFooter page={itineraryPages.length + 3} total={totalPages} />
            </div>
          )}

          <div className="page">
            <img src="/Starry Nights Holidays.png" className="quote-watermark" alt="" />
            <QuoteHeader template={data.template} title={data.heroTitle} />
            <h3 className="section-title">Booking Terms</h3>
            <div className="terms-block">
              <p>Package confirmation requires an advance payment as communicated by the sales team.</p>
              <p>Balance payment must be completed before the travel date as per the agreed payment schedule.</p>
              <p>Hotel check-in, vehicle reporting, sightseeing order, and operational routing may change because of availability, weather, traffic, or local restrictions.</p>
              <p>Any government tax change, permit fee, entrance fee, or third-party supplier revision will be applied as per actuals.</p>
              <p>Services not mentioned under inclusions are not part of the package cost.</p>
            </div>
            <QuoteFooter page={itineraryPages.length + (isInternational ? 4 : 3)} total={totalPages} />
          </div>

          <div className="page">
            <img src="/Starry Nights Holidays.png" className="quote-watermark" alt="" />
            <QuoteHeader template={data.template} title={data.heroTitle} />
            <h3 className="section-title">Cancellation Policy and Account Details</h3>
            <div className="terms-block">
              <p>All cancellation requests must be communicated in writing.</p>
              <p>Advance amount is non-refundable unless explicitly agreed in writing.</p>
              <p>Supplier cancellation charges for hotels, transport, flights, trains, visas, and third-party services will apply as per supplier policy.</p>
              <p>No refund will be applicable for no-shows or unused services after tour commencement.</p>
            </div>
            <div className="account-box">
              <strong>Starry Nights Tours and Adventures</strong>
              <span>Bank: State Bank of India</span>
              <span>Account No: 43878937591</span>
              <span>Branch: Dhanegaon, MIDC, Nanded (MH)</span>
              <span>IFSC: SBIN0020425</span>
            </div>
            <div className="regards-section">
              <img src="/Starry Nights Holidays.png" className="regards-logo" alt="Starry Nights Holidays" />
              <p><strong>Warm Regards,</strong></p>
              <h3>{form.employeeName || "Starry Nights Team"}</h3>
              <p>{COMPANY.legalName}</p>
              <p>{COMPANY.phone} | {COMPANY.email}</p>
            </div>
            <QuoteFooter page={totalPages} total={totalPages} />
          </div>
        </div>
      )}
    </div>
  );
}
