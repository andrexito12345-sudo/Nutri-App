// src/components/DietGeneratorPro.jsx
import React, { useState, useEffect, useRef } from "react";
import { foodDatabase, foodGroups } from "../data/foodDatabase";
import "./DietGenerator.css";

// === ICONOS SVG PROFESIONALES ===
const Icons = {
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
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2-2z"/>
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
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8a2 2 0 0 0-2 2c0 1.33.67 2 2 2 1.33 0 2 .67 2 2a2 2 0 0 1-2 2"/>
        </svg>
    ),
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

// === COMIDAS ===
const MEAL_TIMES = {
    BREAKFAST: { id: "breakfast", label: "Desayuno", Icon: Icons.Sunrise, time: "07:00 - 09:00", color: "#f59e0b" },
    MID_MORNING: { id: "mid_morning", label: "Media Mañana", Icon: Icons.Sun, time: "10:30 - 11:30", color: "#eab308" },
    LUNCH: { id: "lunch", label: "Almuerzo", Icon: Icons.Utensils, time: "12:30 - 14:00", color: "#10b981" },
    SNACK: { id: "snack", label: "Merienda", Icon: Icons.Apple, time: "16:00 - 17:00", color: "#ef4444" },
    DINNER: { id: "dinner", label: "Cena", Icon: Icons.Moon, time: "19:30 - 21:00", color: "#6366f1" },
};

// === QUICK PORTION INPUT - SIMPLIFICADO ===
const QuickPortionInput = ({ food, onAdd, onCancel }) => {
    const [portionText, setPortionText] = useState("100");
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const parsePortion = (text) => {
        const match = text.match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : 100;
    };

    const handleAdd = () => {
        const grams = parsePortion(portionText);
        const factor = grams / 100;

        const scaledFood = {
            ...food,
            cantidad: grams,
            kcal: Math.round(food.kcal * factor),
            proteina: parseFloat((food.proteina * factor).toFixed(1)),
            carbohidratos: parseFloat((food.carbohidratos * factor).toFixed(1)),
            grasas: parseFloat((food.grasas * factor).toFixed(1)),
            uniqueId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        onAdd(scaledFood);
    };

    return (
        <div className="dg-quick-portion">
            <div className="dg-quick-portion__input">
                <input
                    ref={inputRef}
                    type="text"
                    value={portionText}
                    onChange={(e) => setPortionText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder="100g"
                />
                <button className="dg-quick-portion__add" onClick={handleAdd}>
                    <Icons.Check />
                </button>
                <button className="dg-quick-portion__cancel" onClick={onCancel}>
                    <Icons.Close />
                </button>
            </div>
        </div>
    );
};

// === COMPONENTE PRINCIPAL - CON LAS 3 MEJORAS PEDIDAS ===
const DietGeneratorPro = ({ onClose, onSave, initialData = {} }) => {
    const [targetCalories, setTargetCalories] = useState(initialData.targetKcal || 2000);
    const [proteinGoal] = useState(initialData.proteinGoal || 0);
    const [carbsGoal] = useState(initialData.carbsGoal || 0);
    const [fatGoal] = useState(initialData.fatGoal || 0);
    const [patientName] = useState(initialData.patientName || "Paciente");
    const [dietType] = useState(initialData.dietType || "Personalizado");

    const [diet, setDiet] = useState(Object.fromEntries(Object.keys(MEAL_TIMES).map(key => [key, []])));
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("Todos"); // NUEVO: FILTRO POR GRUPO
    const [activeMeal, setActiveMeal] = useState("BREAKFAST");
    const [recentlyAdded, setRecentlyAdded] = useState(null);
    const [portionFood, setPortionFood] = useState(null);

    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    // CÁLCULO CORRECTO DE TOTALES (se actualiza en vivo)
    const totals = React.useMemo(() =>
            Object.values(diet).flat().reduce((acc, item) => ({
                kcal: acc.kcal + (item.kcal || 0),
                protein: acc.protein + (item.proteina || 0),
                carbs: acc.carbs + (item.carbohidratos || 0),
                fat: acc.fat + (item.grasas || 0),
            }), { kcal: 0, protein: 0, carbs: 0, fat: 0 }),
        [diet]
    );

    const progress = Math.min((totals.kcal / targetCalories) * 100, 100);
    const remaining = targetCalories - totals.kcal;

    // GRUPOS ÚNICOS + "Todos"
    const groups = React.useMemo(() =>
            ["Todos", ...new Set(foodDatabase.map(f => f.grupo))].sort(),
        []
    );

    // ALIMENTOS FILTRADOS
    const filteredFoods = React.useMemo(() =>
            foodDatabase
                .filter(f => selectedGroup === "Todos" || f.grupo === selectedGroup)
                .filter(f => f.alimento.toLowerCase().includes(searchTerm.toLowerCase())),
        [selectedGroup, searchTerm]
    );

    const addFood = (scaledFood) => {
        setDiet(prev => ({ ...prev, [activeMeal]: [...prev[activeMeal], scaledFood] }));
        setRecentlyAdded(scaledFood.uniqueId);
        setTimeout(() => setRecentlyAdded(null), 600);
        setPortionFood(null);
    };

    const removeFood = (mealKey, uniqueId) => {
        setDiet(prev => ({ ...prev, [mealKey]: prev[mealKey].filter(i => i.uniqueId !== uniqueId) }));
    };

    const startAddingFood = (food) => setPortionFood(food);
    const confirmAddFood = (scaledFood) => addFood(scaledFood);
    const cancelAddFood = () => setPortionFood(null);
    const getMealCalories = (key) => diet[key].reduce((s, i) => s + (i.kcal || 0), 0);

    return (
        <div className="diet-generator">
            {/* TU HEADER ORIGINAL CON KCAL EN VIVO */}
            <header className="dg-header">
                <div className="dg-header__brand">
                    <div className="dg-logo">
                        <div className="dg-logo__icon"><Icons.Activity /></div>
                        <div className="dg-logo__text">
                            <div className="dg-logo__title">Plan para: <strong>{patientName}</strong></div>
                            <div className="dg-logo__subtitle">
                                {dietType} • Meta: {targetCalories.toLocaleString()} kcal • P: {proteinGoal}g • C: {carbsGoal}g • G: {fatGoal}g
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dg-header__stats">
                    <div className="dg-target">
                        <div className="dg-target__icon"><Icons.Target /></div>
                        <div className="dg-target__content">
                            <span className="dg-target__value">{totals.kcal}</span>
                            <span className="dg-target__label">de {targetCalories} kcal</span>
                        </div>
                    </div>

                    <div className="dg-macros">
                        <div className="dg-macro dg-macro--protein">
                            <Icons.Protein />
                            <span>{totals.protein.toFixed(0)}g</span>
                            <small>de {proteinGoal}g</small>
                        </div>
                        <div className="dg-macro dg-macro--carbs">
                            <Icons.Carbs />
                            <span>{totals.carbs.toFixed(0)}g</span>
                            <small>de {carbsGoal}g</small>
                        </div>
                        <div className="dg-macro dg-macro--fat">
                            <Icons.Fat />
                            <span>{totals.fat.toFixed(0)}g</span>
                            <small>de {fatGoal}g</small>
                        </div>
                    </div>
                </div>

                <div className="dg-header__actions">
                    <button className="dg-btn dg-btn--ghost" onClick={onClose}><Icons.Close /> Cancelar</button>
                    <button className="dg-btn dg-btn--primary" onClick={() => onSave({ targetCalories, totals, meals: diet })}><Icons.Save /> Guardar Plan</button>
                </div>
            </header>

            <div className="dg-workspace">
                <aside className="dg-sidebar">
                    <div className="dg-search">
                        <Icons.Search />
                        <input type="text" placeholder="Buscar alimentos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>

                    {/* MENÚ DE CATEGORÍAS */}
                    {/* CHIPS HORIZONTALES DE CATEGORÍAS - UX ÉLITE */}
                    <div className="dg-category-chips-container">
                        <div className="dg-category-chips">
                            {groups.map(group => (
                                <button
                                    key={group}
                                    className={`dg-category-chip ${selectedGroup === group ? 'active' : ''}`}
                                    onClick={() => setSelectedGroup(group)}
                                >
                                    {group}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* LISTA DE ALIMENTOS */}
                    <div className="dg-food-grid">
                        {filteredFoods.slice(0, 100).map(food => {
                            const isAdding = portionFood?.id === food.id;
                            return (
                                <div
                                    key={food.id}
                                    className={`dg-food-card ${isAdding ? 'adding' : ''}`}
                                    onClick={() => !isAdding && startAddingFood(food)}
                                >
                                    {/* Header del alimento */}
                                    <div className="dg-food-card__header">
                                        <h4 className="dg-food-card__name">{food.alimento}</h4>
                                        <span className="dg-food-card__group">{food.grupo}</span>
                                    </div>

                                    {/* Macros principales */}
                                    <div className="dg-food-card__macros">
                                        <div className="dg-food-macro dg-food-macro--kcal">
                                            <Icons.Flame />
                                            <span>{food.kcal}</span>
                                            <small>kcal</small>
                                        </div>
                                        <div className="dg-food-macro dg-food-macro--protein">
                                            <Icons.Protein />
                                            <span>{food.proteina}g</span>
                                            <small>P</small>
                                        </div>
                                        <div className="dg-food-macro dg-food-macro--carbs">
                                            <Icons.Carbs />
                                            <span>{food.carbohidratos}g</span>
                                            <small>C</small>
                                        </div>
                                        <div className="dg-food-macro dg-food-macro--fat">
                                            <Icons.Fat />
                                            <span>{food.grasas}g</span>
                                            <small>G</small>
                                        </div>
                                    </div>

                                    {/* Botón + o Quick Portion */}
                                    <div className="dg-food-card__action">
                                        {isAdding ? (
                                            <QuickPortionInput
                                                food={food}
                                                onAdd={confirmAddFood}
                                                onCancel={cancelAddFood}
                                            />
                                        ) : (
                                            <button className="dg-food-card__add-btn">
                                                <Icons.Plus />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {/* TU BOARD ORIGINAL (sin cambios) */}
                <main className="dg-board">
                    <div className="dg-columns">
                        {Object.entries(MEAL_TIMES).map(([key, meal]) => {
                            const MealIcon = meal.Icon;
                            const items = diet[key];
                            const mealCalories = getMealCalories(key);

                            return (
                                <div key={key} className={`dg-column ${activeMeal === key ? 'active' : ''}`} onClick={() => setActiveMeal(key)}>
                                    <div className="dg-column__header">
                                        <div className="dg-column__title">
                                            <span className="dg-column__icon"><MealIcon /></span>
                                            <div className="dg-column__info">
                                                <h3>{meal.label}</h3>
                                                <span className="dg-column__time"><Icons.Clock /> {meal.time}</span>
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
                                                <div key={item.uniqueId} className={`dg-card ${recentlyAdded === item.uniqueId ? 'added' : ''}`}>
                                                    <div className="dg-card__content">
                                                        <h4>{item.alimento}</h4>
                                                        <div className="dg-card__portion">
                                                            {item.cantidad}g
                                                        </div>
                                                        <div className="dg-card__macros">
                                                            <span className="dg-card__kcal"><Icons.Flame /> {item.kcal} kcal</span>
                                                            <span>P: {item.proteina}g</span>
                                                            <span>C: {item.carbohidratos}g</span>
                                                            <span>G: {item.grasas}g</span>
                                                        </div>
                                                    </div>
                                                    <button className="dg-card__remove" onClick={(e) => { e.stopPropagation(); removeFood(key, item.uniqueId); }}>
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