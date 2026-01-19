/**
 * Sidebar Configuration
 * 
 * Centralized menu item definitions with capability-based access control.
 * Items without a capability are visible to all authenticated users.
 */

import {
    Home, BookOpen, Clock, Calendar, Book, LibraryBig, Users,
    BookType, Languages, ScrollText, User
} from "lucide-react";
import { Capability } from '@/features/authentication/types/user_roles';
import type { MenuItem } from "@/common/components/ui/sidebar";

export const SIDEBAR_ITEMS: MenuItem[] = [
    // Navigation Group - Available to all users
    {
        group: "sidebar.navigation",
        title: "sidebar.home",
        url: "/",
        icon: Home,
        requiresAuth: false
    },
    {
        group: "sidebar.navigation",
        title: "sidebar.salas",
        url: "/salas",
        icon: BookOpen,
        requiresAuth: false
    },
    {
        group: "sidebar.navigation",
        title: "sidebar.history",
        url: "/historia",
        icon: Clock,
        requiresAuth: false
    },

    // Administration Group - Requires specific capabilities
    {
        group: "sidebar.administration",
        title: "sidebar.roomBooking",
        url: "/prestamo/sala",
        icon: Calendar,
        requiresAuth: true,
        capability: Capability.MANAGE_ROOMS
    },
    {
        group: "sidebar.administration",
        title: "sidebar.contentManagement",
        url: "",
        icon: Book,
        requiresAuth: true,
        capability: Capability.MANAGE_CONTENT,
        children: [
            { title: "sidebar.collection", url: "/gestion/coleccion", icon: LibraryBig, requiresAuth: true, capability: Capability.MANAGE_CONTENT },
            { title: "sidebar.genres", url: "/gestion/generos", icon: BookType, requiresAuth: true, capability: Capability.MANAGE_CONTENT },
            { title: "sidebar.languages", url: "/gestion/lenguajes", icon: Languages, requiresAuth: true, capability: Capability.MANAGE_CONTENT },
            { title: "sidebar.materials", url: "/gestion/materiales", icon: ScrollText, requiresAuth: true, capability: Capability.MANAGE_CONTENT },
            { title: "sidebar.authors", url: "/gestion/autores", icon: User, requiresAuth: true, capability: Capability.MANAGE_CONTENT },
        ]
    },
    {
        group: "sidebar.administration",
        title: "sidebar.userManagement",
        url: "/gestion/usuarios",
        icon: Users,
        requiresAuth: true,
        capability: Capability.MANAGE_USERS
    },
];
