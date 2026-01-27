import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import {
  MenuItem, Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarMenuDropdown, SidebarMenuDropdownItem, useSidebar,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem
} from "@/common/components/ui/sidebar";


import { Link } from 'react-router-dom';
import { SIDEBAR_ITEMS } from './Sidebar.config';
import { hasCapability } from '@/features/authentication/types/user_roles';
import { useTranslation } from 'react-i18next';

type GroupedMenuItems = {
  [key: string]: MenuItem[];
};

export function AppSidebar() {
  const { t } = useTranslation();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userRole = useSelector((state: RootState) => state.auth.userRole);
  const { isMobile, setOpenMobile } = useSidebar();

  const handleMobileClose = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Filter items based on authentication and capability
  const visibleItems = SIDEBAR_ITEMS.filter(item => {
    // Check authentication requirement
    if (item.requiresAuth && !isAuthenticated) return false;
    // Check capability requirement (if specified)
    if (item.capability && !hasCapability(userRole, item.capability)) return false;
    return true;
  });

  // Filter children based on capability
  const filteredItems = visibleItems.map(item => {
    if (!item.children) return item;
    const filteredChildren = item.children.filter(child => {
      if (child.capability && !hasCapability(userRole, child.capability)) return false;
      return true;
    });
    return { ...item, children: filteredChildren };
  });

  const groupedItems = filteredItems.reduce((acc: GroupedMenuItems, item) => {
    (acc[item.group] = acc[item.group] || []).push(item);
    return acc;
  }, {} as GroupedMenuItems);

  return (
    <Sidebar className="border-r border-sidebar-border bg-interface">
      <SidebarHeader className="border-b border-sidebar-border/20">
        <div className="flex flex-col items-center py-4">
          <img
            src="/julian_padron_transparent.png"
            alt="Dr. Julián Padrón"
            className="w-auto h-24 mb-2 object-contain filter drop-shadow-md"
          />
          <h2 className="font-display text-sm font-semibold text-white text-center leading-tight">
            {t('sidebar.brand.title')}
          </h2>
          <p className="text-xs text-biblioteca-gold text-center">
            {t('sidebar.brand.subtitle')}
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <SidebarGroup key={groupName}>
            <SidebarGroupLabel className="text-biblioteca-gold font-medium">
              {t(groupName)}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(item => (
                  <div key={item.title}>
                    {item.children && item.children.length > 0 ? (
                      <SidebarMenuDropdown
                        label={t(item.title)}
                        icon={<item.icon size={18} />}
                      >
                        {item.children.map(child => (
                          <SidebarMenuDropdownItem key={child.title}>
                            <Link
                              to={child.url}
                              className="flex items-center gap-3 w-full h-full"
                              onClick={handleMobileClose}
                            >
                              <child.icon size={18} />
                              <span>{t(child.title)}</span>
                            </Link>
                          </SidebarMenuDropdownItem>
                        ))}
                      </SidebarMenuDropdown>
                    ) : (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          className="text-white hover:bg-biblioteca-blue/50 hover:text-biblioteca-gold transition-colors duration-200"
                        >
                          <Link
                            to={item.url}
                            className="flex items-center gap-3"
                            onClick={handleMobileClose}
                          >
                            <item.icon size={18} />
                            <span>{t(item.title)}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </div>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/20 p-4">
        <div className="text-center">
          <p className="text-xs text-biblioteca-gold">
            {t('sidebar.footer.address')}
          </p>
          <p className="text-xs text-white/80">
            {t('sidebar.footer.city_state_country')}
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
