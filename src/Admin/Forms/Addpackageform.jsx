import "./Addpackageform.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Utils/api";
import { resolveAssetUrl, uploadFile } from "../../Utils/fileUpload";

function AddPackageForm({ mode = "add", data = {}, onSubmit }) {
  const navigate = useNavigate();

  const initialState = {
    id: "",
    heroTitle: "",
    shortTitle: "",
    brandName: "",
    selectedCategories: {},
    days: 1,
    highlights: "",
    overview: "",
    avgCost: "",
    pickup: "",
    itinerary: [{ day: 1, title: "", desc: "" }],
    note: "",
    includes: "",
    excludes: "",
    heroImages: [null, null, null, null],
    thumbnail: null
  };

  const [form, setForm] = useState(initialState);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const items = await api.get("/categories");
        setCategories(Array.isArray(items) ? items : []);
      } catch (error) {
        console.error("Failed to load categories", error);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (mode === "edit" && data) {
      setForm({
        ...initialState,
        ...data,
        id: data.packageCode || data.code || data.id || "",
        includes: Array.isArray(data.inclusions) ? data.inclusions.join("\n") : data.includes || "",
        excludes: Array.isArray(data.exclusions) ? data.exclusions.join("\n") : data.excludes || "",
        heroImages: data.images?.length ? [...data.images, null, null, null, null].slice(0, 4) : [null, null, null, null],
        thumbnail: data.thumbnailUrl || null,
        itinerary: data.itinerary?.length ? data.itinerary.map((item) => ({
          day: item.day,
          title: item.title,
          desc: item.desc || item.description || ""
        })) : [{ day: 1, title: "", desc: "" }]
      });
    }
  }, [data, mode]);

  useEffect(() => {
    if (mode !== "edit" || !data?.categoryCodes?.length || !categories.length) return;
    const grouped = {};
    data.categoryCodes.forEach((code) => {
      const category = categories.find((cat) => (cat.code || cat.categoryCode || cat.id) === code);
      const parentCode = category?.parent && category.parent !== "-" ? category.parent : code;
      grouped[parentCode] = grouped[parentCode] || [];
      grouped[parentCode].push(code);
    });
    setForm((prev) => ({ ...prev, selectedCategories: grouped }));
  }, [categories, data, mode]);

  useEffect(() => {
    setForm((prev) => {
      const days = Number(prev.days || 1);
      let itinerary = [...prev.itinerary];
      if (days > itinerary.length) {
        for (let i = itinerary.length + 1; i <= days; i += 1) {
          itinerary.push({ day: i, title: "", desc: "" });
        }
      } else {
        itinerary = itinerary.slice(0, days);
      }
      return { ...prev, itinerary };
    });
  }, [form.days]);

  const groupedCategories = useMemo(() => {
    const groups = {};
    categories.forEach((cat) => {
      const code = cat.code || cat.categoryCode || cat.id;
      const parent = cat.parent && cat.parent !== "-" ? cat.parent : "";
      const isSub = cat.isSub || cat.isSubcategory || Boolean(parent);
      if (!isSub) {
        groups[code] = groups[code] || { parent: cat, children: [] };
        groups[code].parent = cat;
      } else if (parent) {
        groups[parent] = groups[parent] || { parent: null, children: [] };
        groups[parent].children.push(cat);
      }
    });
    return groups;
  }, [categories]);

  const brandOptions = ["Holidays", "Adventures", "GroupTour"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (parentCode, childCode) => {
    setForm((prev) => {
      const prevSelected = prev.selectedCategories[parentCode] || [];
      const selected = prevSelected.includes(childCode)
        ? prevSelected.filter((id) => id !== childCode)
        : [...prevSelected, childCode];
      return {
        ...prev,
        selectedCategories: {
          ...prev.selectedCategories,
          [parentCode]: selected
        }
      };
    });
  };

  const handleHeroImageChange = (index, file) => {
    const updated = [...form.heroImages];
    updated[index] = file;
    setForm({ ...form, heroImages: updated });
  };

  const handleItineraryChange = (index, field, value) => {
    const updated = [...form.itinerary];
    updated[index][field] = value;
    setForm({ ...form, itinerary: updated });
  };

  const getImageSrc = (img) => {
    if (!img) return "";
    if (typeof img === "string") return resolveAssetUrl(img);
    return URL.createObjectURL(img);
  };

  const handleSubmit = async () => {
    const categoryCodes = Object.values(form.selectedCategories).flat();
    const heroImages = await Promise.all(
      form.heroImages.filter(Boolean).map((img) => uploadFile(img, "packages"))
    );
    const thumbnailUrl = await uploadFile(form.thumbnail, "packages");

    const payload = {
      packageCode: form.id,
      heroTitle: form.heroTitle,
      shortTitle: form.shortTitle,
      brandName: form.brandName,
      days: form.days,
      highlights: form.highlights,
      overview: form.overview,
      avgCost: form.avgCost,
      pickup: form.pickup,
      itinerary: form.itinerary,
      note: form.note,
      includes: form.includes,
      excludes: form.excludes,
      categoryCodes,
      heroImages,
      thumbnailUrl
    };

    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else if (mode === "edit") {
        await api.put(`/packages/${form.id}`, payload);
      } else {
        await api.post("/packages", payload);
      }
      navigate("/admin/packages");
    } catch (error) {
      console.error("Failed to save package", error);
      alert("Unable to save package");
    }
  };

  const CategoryBlock = ({ group, selected, onChange }) => {
    const [search, setSearch] = useState("");
    const parentCode = group.parent?.code || group.parent?.categoryCode || group.parent?.id;
    const isExplorerRegion = parentCode === "DOM" || parentCode === "INT";
    const filtered = group.children.filter((child) =>
      (child.name || child.title || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div className={`category-card ${isExplorerRegion ? "explorer-region-card" : ""}`}>
        <div className="category-header sticky">
          <span>
            {group.parent?.name || group.parent?.title}
            {isExplorerRegion && <em>Global Explorer</em>}
          </span>
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="category-options">
          {filtered.map((child) => {
            const childCode = child.code || child.categoryCode || child.id;
            return (
              <div
                key={childCode}
                className={`option ${selected.includes(childCode) ? "active" : ""}`}
                onClick={() => onChange(parentCode, childCode)}
              >
                <span>{child.name || child.title}</span>
                <small>{childCode}</small>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="pkg-form">
      <div className="form-section">
        <h3>Main Details</h3>
        <div className="grid-2">
          <input name="id" value={form.id} disabled={mode === "edit"} onChange={handleChange} placeholder="Package Code" />
          <input name="heroTitle" value={form.heroTitle} onChange={handleChange} placeholder="Hero Title" />
          <input name="shortTitle" value={form.shortTitle} onChange={handleChange} placeholder="Short Title" />
          <select name="brandName" value={form.brandName} onChange={handleChange}>
            <option value="">Select Brand</option>
            {brandOptions.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
          </select>
          <input type="number" name="days" value={form.days} onChange={handleChange} />
          <input name="avgCost" value={form.avgCost} onChange={handleChange} placeholder="Cost" />
          <input name="pickup" value={form.pickup} onChange={handleChange} placeholder="Pickup" />
        </div>
      </div>

      <div className="form-section">
        <h3>Categories</h3>
        <p className="category-help">
          Select a Domestic or International region to make this package appear in Starry Nights Global Explorer map results.
        </p>
        <div className="category-dynamic">
          {Object.values(groupedCategories).map((group) => (
            group.parent && (
              <CategoryBlock
                key={group.parent.code || group.parent.id}
                group={group}
                selected={form.selectedCategories[group.parent.code || group.parent.categoryCode || group.parent.id] || []}
                onChange={handleCategoryChange}
              />
            )
          ))}
        </div>
      </div>

      <div className="form-section">
        <h3>Description</h3>
        <div className="grid-2">
          <textarea className="full-width" name="highlights" value={form.highlights} onChange={handleChange} placeholder="Highlights" />
          <textarea className="full-width" name="overview" value={form.overview} onChange={handleChange} placeholder="Overview" />
          <textarea name="includes" value={form.includes} onChange={handleChange} placeholder="Includes" />
          <textarea name="excludes" value={form.excludes} onChange={handleChange} placeholder="Excludes" />
          <textarea name="note" value={form.note} onChange={handleChange} placeholder="Note" />
        </div>
      </div>

      <div className="form-section">
        <h3>Itinerary</h3>
        {form.itinerary.map((day, i) => (
          <div key={i} className="day-box">
            <h4>Day {day.day}</h4>
            <input value={day.title} onChange={(e) => handleItineraryChange(i, "title", e.target.value)} />
            <textarea value={day.desc} onChange={(e) => handleItineraryChange(i, "desc", e.target.value)} />
          </div>
        ))}
      </div>

      <div className="form-section">
        <h3>Media</h3>
        <div className="image-grid">
          {form.heroImages.map((img, i) => (
            <div key={i} className="image-slot">
              {getImageSrc(img) ? <img src={getImageSrc(img)} alt="" /> : <span>Upload</span>}
              <input type="file" onChange={(e) => handleHeroImageChange(i, e.target.files[0])} />
            </div>
          ))}
        </div>

        <div className="thumbnail-slot">
          {getImageSrc(form.thumbnail) ? <img src={getImageSrc(form.thumbnail)} alt="" /> : <span>Upload Thumbnail</span>}
          <input type="file" onChange={(e) => setForm({ ...form, thumbnail: e.target.files[0] })} />
        </div>
      </div>

      <button className="submit-btn" onClick={handleSubmit}>
        {mode === "add" ? "Add Package" : "Update Package"}
      </button>
    </div>
  );
}

export default AddPackageForm;
