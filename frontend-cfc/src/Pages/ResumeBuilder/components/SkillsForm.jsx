import React, { useState } from "react";
import { FaPlus, FaTrash, FaTimes } from "react-icons/fa";
import { createSkillGroup } from "../../../Data/resumeData";

/**
 * SkillsForm — manages skill groups with tag-style inputs.
 */
const SkillsForm = ({ items, onChange, accentColor = "#0076B4" }) => {
  const inputClass =
    "w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)] transition-all";

  const [newSkills, setNewSkills] = useState({});

  const addGroup = () => {
    onChange([...items, createSkillGroup()]);
  };

  const removeGroup = (id) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const updateCategory = (id, value) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, category: value } : item,
      ),
    );
  };

  const addSkillToGroup = (id) => {
    const skill = (newSkills[id] || "").trim();
    if (!skill) return;

    onChange(
      items.map((item) =>
        item.id === id && !item.items.includes(skill)
          ? { ...item, items: [...item.items, skill] }
          : item,
      ),
    );
    setNewSkills({ ...newSkills, [id]: "" });
  };

  const removeSkillFromGroup = (groupId, skillIndex) => {
    onChange(
      items.map((item) =>
        item.id === groupId
          ? { ...item, items: item.items.filter((_, i) => i !== skillIndex) }
          : item,
      ),
    );
  };

  const handleSkillKeyDown = (e, id) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkillToGroup(id);
    }
  };

  return (
    <div className="space-y-5">
      {items.map((group, index) => (
        <div
          key={group.id}
          className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-4 relative group hover:border-slate-200 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white"
                style={{ backgroundColor: accentColor }}
              >
                {index + 1}
              </div>
              <span className="text-xs font-bold text-slate-500">
                {group.category || "New Group"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeGroup(group.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              title="Remove"
            >
              <FaTrash size={10} />
            </button>
          </div>

          <input
            type="text"
            value={group.category}
            onChange={(e) => updateCategory(group.id, e.target.value)}
            placeholder="Category (e.g. Frontend, Backend, Tools)"
            className={inputClass}
          />

          {/* Skill tags */}
          {group.items.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {group.items.map((skill, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: `${accentColor}12`,
                    color: accentColor,
                  }}
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkillFromGroup(group.id, i)}
                    className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10 cursor-pointer transition-colors"
                  >
                    <FaTimes size={7} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add skill input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkills[group.id] || ""}
              onChange={(e) =>
                setNewSkills({ ...newSkills, [group.id]: e.target.value })
              }
              onKeyDown={(e) => handleSkillKeyDown(e, group.id)}
              placeholder="Type a skill and press Enter"
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={() => addSkillToGroup(group.id)}
              className="px-5 py-3 rounded-xl text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer hover:shadow-md"
              style={{ backgroundColor: accentColor }}
            >
              Add
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addGroup}
        className="flex items-center gap-2.5 px-4 py-3.5 text-xs font-black uppercase tracking-wider rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all w-full justify-center cursor-pointer"
      >
        <FaPlus size={10} /> Add Skill Group
      </button>
    </div>
  );
};

export default SkillsForm;
