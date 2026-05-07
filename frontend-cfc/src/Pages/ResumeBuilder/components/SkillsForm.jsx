import React, { useState } from "react";
import { FaPlus, FaTrash, FaTimes } from "react-icons/fa";
import { createSkillGroup } from "../../../Data/resumeData";

/**
 * SkillsForm — manages skill groups with tag-style inputs.
 */
const SkillsForm = ({ items, onChange, accentColor = "#0076B4" }) => {
  const inputClass =
    "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white transition-all";

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
    <div className="space-y-4">
      {items.map((group, index) => (
        <div
          key={group.id}
          className="p-3 bg-slate-50/50 border border-slate-100 rounded-lg space-y-3 relative group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase">
              Group #{index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeGroup(group.id)}
              className="text-rose-400 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Remove"
            >
              <FaTrash size={11} />
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
          <div className="flex flex-wrap gap-1.5">
            {group.items.map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold"
                style={{
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                }}
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkillFromGroup(group.id, i)}
                  className="hover:opacity-70 cursor-pointer"
                >
                  <FaTimes size={8} />
                </button>
              </span>
            ))}
          </div>

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
              className="px-3 py-2 rounded-lg text-white text-xs font-bold transition-colors cursor-pointer"
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
        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors w-full justify-center cursor-pointer"
      >
        <FaPlus size={10} /> Add Skill Group
      </button>
    </div>
  );
};

export default SkillsForm;
