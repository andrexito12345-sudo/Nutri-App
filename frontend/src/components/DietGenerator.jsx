// src/components/DietGeneratorPro.jsx
import React, { useState, useEffect, useRef } from "react";
import { foodDatabase, foodGroups } from "../data/foodDatabase";
import "./DietGenerator.css";

// === ICONOS SVG PROFESIONALES ===
const Icons = {
    // UI Icons
    Search: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
    ),
    Close: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
    ),
    Save: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
        </svg>
    ),
    Plus: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
        </svg>
    ),
    Trash: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
    ),
    Target: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
        </svg>
    ),
    ChevronDown: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9"/>
        </svg>
    ),
    Check: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    ),
    Filter: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
    ),
    Activity: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
    ),
    Clock: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
    ),

    // Nutrient Icons
    Flame: () => (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 23c-4.97 0-9-3.58-9-8 0-2.52 1.17-5.23 3.5-8.5.93-1.3 2-2.65 3.17-4.05.35-.42.98-.42 1.33 0 1.17 1.4 2.24 2.75 3.17 4.05C16.83 9.77 18 12.48 18 15c0 4.42-4.03 8-6 8z"/>
        </svg>
    ),
    Protein: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/>
        </svg>
    ),
    Carbs: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
    ),
    Fat: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2c-5.33 4-8 8-8 12a8 8 0 1 0 16 0c0-4-2.67-8-8-12z"/>
        </svg>
    ),

    // Meal Time Icons (SVG profesionales)
    Sunrise: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/>
            <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/>
            <line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
            <line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/>
        </svg>
    ),
    Sun: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
    ),
    Utensils: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
        </svg>
    ),
    Apple: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/>
            <path d="M10 2c1 .5 2 2 2 5"/>
        </svg>
    ),
    Moon: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
    ),
};

// Configuración de tiempos de comida con iconos SVG
const MEAL_TIMES = {
    BREAKFAST: {
        id: "breakfast",
        label: "Desayuno",
        Icon: Icons.Sunrise,
        time: "07:00 - 09:00",
        color: "#f59e0b"
    },
    MID_MORNING: {
        id: "mid_morning",
        label: "Media Mañana",
        Icon: Icons.Sun,
        time: "10:30 - 11:30",
        color: "#eab308"
    },
    LUNCH: {
        id: "lunch",
        label: "Almuerzo",
        Icon: Icons.Utensils,
        time: "12:30 - 14:00",
        color: "#10b981"
    },
    SNACK: {
        id: "snack",
        label: "Merienda",
        Icon: Icons.Apple,
        time: "16:00 - 17:00",
        color: "#ef4444"
    },
    DINNER: {
        id: "dinner",
        label: "Cena",
        Icon: Icons.Moon,
        time: "19:30 - 21:00",
        color: "#6366f1"
    },
};

const DietGeneratorPro = ({ onClose, onSave }) => {
    // === ESTADOS ===
    const [targetCalories, setTargetCalories] = useState(2000);
    const [isEditingTarget, setIsEditingTarget] = useState(false);
    const targetInputRef = useRef(null);

    const [diet, setDiet] = useState(
        Object.fromEntries(Object.keys(MEAL_TIMES).map(key => [key, []]))
    );

    const [searchTerm, setSearchTerm] = useState("");
    const [activeGroup, setActiveGroup] = useState("Todos");
    const [activeMeal, setActiveMeal] = useState("BREAKFAST");
    const [recentlyAdded, setRecentlyAdded] = useState(null);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const categoryRef = useRef(null);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (categoryRef.current && !categoryRef.current.contains(e.target)) {
                setIsCategoryOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // === CÁLCULOS ===
    const totals = Object.values(diet).flat().reduce(
        (acc, item) => ({
            kcal: acc.kcal + item.kcal,
            protein: acc.protein + item.proteina,
            carbs: acc.carbs + item.carbohidratos,
            fat: acc.fat + item.grasas,
        }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const progress = Math.min((totals.kcal / targetCalories) * 100, 100);
    const remaining = targetCalories - totals.kcal;

    const getMealCalories = (mealKey) =>
        diet[mealKey].reduce((sum, item) => sum + item.kcal, 0);

    // === ACCIONES ===
    const addFood = (food) => {
        const newFood = { ...food, uniqueId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
        setDiet(prev => ({
            ...prev,
            [activeMeal]: [...prev[activeMeal], newFood]
        }));
        setRecentlyAdded(newFood.uniqueId);
        setTimeout(() => setRecentlyAdded(null), 600);
    };

    const removeFood = (mealKey, uniqueId) => {
        setDiet(prev => ({
            ...prev,
            [mealKey]: prev[mealKey].filter(item => item.uniqueId !== uniqueId)
        }));
    };

    const filteredFoods = foodDatabase.filter(item => {
        const matchesSearch = item.alimento.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGroup = activeGroup === "Todos" || item.grupo === activeGroup;
        return matchesSearch && matchesGroup;
    });

    const getProgressStatus = () => {
        if (progress > 100) return { color: "var(--danger)", label: "Excedido", status: "over" };
        if (progress >= 90) return { color: "var(--success)", label: "Óptimo", status: "optimal" };
        if (progress >= 50) return { color: "var(--primary)", label: "En progreso", status: "progress" };
        return { color: "var(--muted)", label: "Iniciando", status: "start" };
    };

    useEffect(() => {
        if (isEditingTarget && targetInputRef.current) {
            targetInputRef.current.focus();
            targetInputRef.current.select();
        }
    }, [isEditingTarget]);

    const handleSave = () => {
        const dietData = {
            targetCalories,
            totals,
            meals: diet,
            createdAt: new Date().toISOString()
        };
        onSave && onSave(dietData);
    };

    const selectCategory = (group) => {
        setActiveGroup(group);
        setIsCategoryOpen(false);
    };

    const progressStatus = getProgressStatus();

    return (
        <div className="diet-generator">
            {/* === HEADER === */}
            <header className="dg-header">
                <div className="dg-header__brand">
                    <div className="dg-logo">
                        <div className="dg-logo__icon">
                            <Icons.Activity />
                        </div>
                        <div className="dg-logo__text">
                            <span className="dg-logo__title">NutriPlan</span>
                            <span className="dg-logo__subtitle">Clinical Diet Builder</span>
                        </div>
                    </div>
                </div>

                <div className="dg-header__stats">
                    {/* Target Calories */}
                    <div className="dg-target" onClick={() => setIsEditingTarget(true)}>
                        <div className="dg-target__icon"><Icons.Target /></div>
                        <div className="dg-target__content">
                            {isEditingTarget ? (
                                <input
                                    ref={targetInputRef}
                                    type="number"
                                    className="dg-target__input"
                                    value={targetCalories}
                                    onChange={(e) => setTargetCalories(Math.max(0, Number(e.target.value)))}
                                    onBlur={() => setIsEditingTarget(false)}
                                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingTarget(false)}
                                />
                            ) : (
                                <span className="dg-target__value">{targetCalories.toLocaleString()}</span>
                            )}
                            <span className="dg-target__label">kcal meta</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="dg-progress-wrapper">
                        <div className="dg-progress">
                            <div
                                className="dg-progress__fill"
                                style={{ width: `${progress}%`, backgroundColor: progressStatus.color }}
                            />
                        </div>
                        <div className="dg-progress__info">
              <span className={`dg-progress__status dg-progress__status--${progressStatus.status}`}>
                {progressStatus.label}
              </span>
                            <span className="dg-progress__remaining">
                {remaining >= 0 ? `${remaining.toFixed(0)} restantes` : `${Math.abs(remaining).toFixed(0)} excedidas`}
              </span>
                        </div>
                    </div>

                    {/* Macros */}
                    <div className="dg-macros">
                        <div className="dg-macro dg-macro--protein">
                            <Icons.Protein />
                            <span>{totals.protein.toFixed(0)}g</span>
                            <small>Proteína</small>
                        </div>
                        <div className="dg-macro dg-macro--carbs">
                            <Icons.Carbs />
                            <span>{totals.carbs.toFixed(0)}g</span>
                            <small>Carbos</small>
                        </div>
                        <div className="dg-macro dg-macro--fat">
                            <Icons.Fat />
                            <span>{totals.fat.toFixed(0)}g</span>
                            <small>Grasas</small>
                        </div>
                    </div>
                </div>

                <div className="dg-header__actions">
                    <button className="dg-btn dg-btn--ghost" onClick={onClose}>
                        <Icons.Close />
                        <span>Cancelar</span>
                    </button>
                    <button className="dg-btn dg-btn--primary" onClick={handleSave}>
                        <Icons.Save />
                        <span>Guardar Plan</span>
                    </button>
                </div>
            </header>

            {/* === WORKSPACE === */}
            <div className="dg-workspace">
                {/* === SIDEBAR === */}
                <aside className="dg-sidebar">
                    <div className="dg-sidebar__header">
                        <h2>Biblioteca de Alimentos</h2>
                        <span className="dg-sidebar__count">{filteredFoods.length} items</span>
                    </div>

                    {/* Search */}
                    <div className="dg-search">
                        <Icons.Search />
                        <input
                            type="text"
                            placeholder="Buscar alimentos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="dg-search__clear" onClick={() => setSearchTerm("")}>
                                <Icons.Close />
                            </button>
                        )}
                    </div>

                    {/* Category Dropdown */}
                    <div className="dg-category-select" ref={categoryRef}>
                        <button
                            className={`dg-category-trigger ${isCategoryOpen ? 'open' : ''}`}
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        >
                            <Icons.Filter />
                            <span>{activeGroup}</span>
                            <Icons.ChevronDown />
                        </button>

                        {isCategoryOpen && (
                            <div className="dg-category-dropdown">
                                <div
                                    className={`dg-category-option ${activeGroup === "Todos" ? 'active' : ''}`}
                                    onClick={() => selectCategory("Todos")}
                                >
                                    <span>Todos los alimentos</span>
                                    {activeGroup === "Todos" && <Icons.Check />}
                                </div>
                                <div className="dg-category-divider" />
                                {foodGroups.map(group => (
                                    <div
                                        key={group}
                                        className={`dg-category-option ${activeGroup === group ? 'active' : ''}`}
                                        onClick={() => selectCategory(group)}
                                    >
                                        <span>{group}</span>
                                        {activeGroup === group && <Icons.Check />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Food List */}
                    <div className="dg-food-list">
                        {filteredFoods.slice(0, 100).map(food => (
                            <div
                                key={food.id}
                                className="dg-food-item"
                                onClick={() => addFood(food)}
                            >
                                <div className="dg-food-item__info">
                                    <h4>{food.alimento}</h4>
                                    <div className="dg-food-item__meta">
                                        <span className="dg-food-item__group">{food.grupo}</span>
                                        <span className="dg-food-item__portion">por 100g</span>
                                    </div>
                                </div>
                                <div className="dg-food-item__nutrients">
                  <span className="dg-nutrient dg-nutrient--kcal">
                    <Icons.Flame /> {food.kcal}
                  </span>
                                    <span className="dg-nutrient dg-nutrient--prot">
                    P {food.proteina}g
                  </span>
                                </div>
                                <button className="dg-food-item__add">
                                    <Icons.Plus />
                                </button>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* === MAIN BOARD === */}
                <main className="dg-board">
                    {/* Board Header with Tabs */}
                    <div className="dg-board__header">
                        <h2>Plan Nutricional</h2>
                        <nav className="dg-meal-nav">
                            {Object.entries(MEAL_TIMES).map(([key, meal]) => {
                                const MealIcon = meal.Icon;
                                const isActive = activeMeal === key;
                                const itemCount = diet[key].length;

                                return (
                                    <button
                                        key={key}
                                        className={`dg-meal-tab ${isActive ? 'active' : ''}`}
                                        onClick={() => setActiveMeal(key)}
                                        style={{ '--meal-color': meal.color }}
                                    >
                                        <span className="dg-meal-tab__icon"><MealIcon /></span>
                                        <span className="dg-meal-tab__label">{meal.label}</span>
                                        {itemCount > 0 && (
                                            <span className="dg-meal-tab__count">{itemCount}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Columns Grid */}
                    <div className="dg-columns">
                        {Object.entries(MEAL_TIMES).map(([key, meal]) => {
                            const MealIcon = meal.Icon;
                            const mealCalories = getMealCalories(key);
                            const isActive = activeMeal === key;
                            const items = diet[key];

                            return (
                                <div
                                    key={key}
                                    className={`dg-column ${isActive ? 'active' : ''}`}
                                    onClick={() => setActiveMeal(key)}
                                    style={{ '--meal-color': meal.color }}
                                >
                                    <div className="dg-column__header">
                                        <div className="dg-column__title">
                                            <span className="dg-column__icon"><MealIcon /></span>
                                            <div className="dg-column__info">
                                                <h3>{meal.label}</h3>
                                                <span className="dg-column__time">
                          <Icons.Clock /> {meal.time}
                        </span>
                                            </div>
                                        </div>
                                        <div className="dg-column__kcal">
                                            <strong>{mealCalories.toFixed(0)}</strong>
                                            <small>KCAL</small>
                                        </div>
                                    </div>

                                    <div className="dg-column__body">
                                        {items.length === 0 ? (
                                            <div className="dg-empty">
                                                <div className="dg-empty__icon"><Icons.Plus /></div>
                                                <p>Selecciona alimentos de la biblioteca</p>
                                            </div>
                                        ) : (
                                            items.map(item => (
                                                <div
                                                    key={item.uniqueId}
                                                    className={`dg-card ${recentlyAdded === item.uniqueId ? 'added' : ''}`}
                                                >
                                                    <div className="dg-card__content">
                                                        <h4>{item.alimento}</h4>
                                                        <div className="dg-card__macros">
                              <span className="dg-card__kcal">
                                <Icons.Flame /> {item.kcal} kcal
                              </span>
                                                            <span>P: {item.proteina}g</span>
                                                            <span>C: {item.carbohidratos}g</span>
                                                            <span>G: {item.grasas}g</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="dg-card__remove"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeFood(key, item.uniqueId);
                                                        }}
                                                    >
                                                        <Icons.Trash />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DietGeneratorPro;