'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  BuildingOffice2Icon,
  ChartBarIcon,
  DocumentTextIcon,
  CpuChipIcon,
  Cog6ToothIcon,
  BriefcaseIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'PhilogicAI-Academy', href: '/academy', icon: AcademicCapIcon },
  { name: 'CRM', href: '/crm', icon: BuildingOffice2Icon },
  { name: 'Opportunities', href: '/opportunities', icon: BriefcaseIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Dokumente', href: '/documents', icon: DocumentTextIcon },
  { name: 'Agenten', href: '/agents', icon: CpuChipIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div 
      className="w-64 flex flex-col h-screen"
      style={{ 
        backgroundColor: 'var(--clr-surface-a0)',
        borderRight: '1px solid var(--clr-surface-a30)'
      }}
    >
      {/* Logo */}
      <div 
        className="flex items-center h-16 px-4"
        style={{ borderBottom: '1px solid var(--clr-surface-a30)' }}
      >
        <h1 className="text-xl font-bold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
          Philogic<span style={{ color: 'var(--clr-primary-a10)' }}>Hub</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: isActive ? 'var(--clr-surface-a10)' : 'transparent',
                color: isActive ? 'rgb(255 255 255 / 0.9)' : 'rgb(255 255 255 / 0.6)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--clr-surface-a10)';
                  e.currentTarget.style.color = 'rgb(255 255 255 / 0.8)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgb(255 255 255 / 0.6)';
                }
              }}
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div 
        className="px-4 py-4"
        style={{ borderTop: '1px solid var(--clr-surface-a30)' }}
      >
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ 
              background: 'linear-gradient(135deg, var(--clr-primary-a10), var(--clr-info-a10))'
            }}
          >
            <span className="font-bold text-sm" style={{ color: 'var(--clr-light-a0)' }}>P</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Philip</p>
            <p className="text-xs" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
