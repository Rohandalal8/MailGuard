"use client";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() { const { user, logout } = useAuth(); return <header className="topbar"><div><div className="eyebrow">Email security desk</div><div className="muted">{user?.email ?? ""}</div></div><button className="button secondary" onClick={() => void logout()}>Sign out</button></header>; }