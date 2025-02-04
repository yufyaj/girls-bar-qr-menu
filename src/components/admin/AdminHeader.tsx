"use client";
import { Fragment } from 'react'
import Link from 'next/link'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation';
import { logout } from '@/app/actions/auth';

const navigation = [
  { name: 'ダッシュボード', href: '/admin/dashboard' },
  { name: 'メニュー管理', href: '/admin/menu' },
  { name: 'QRコード管理', href: '/admin/qr-codes' },
  { name: '売上管理', href: '/admin/sales' },
  { name: '店員管理', href: '/admin/staff' },
  { name: '店員ドリンク管理', href: '/admin/staff-drinks' },
  { name: 'ユーザー管理', href: '/admin/users' },
  { name: '店舗情報', href: '/admin/store' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function DisclosureContent({ open }: { open: boolean }) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/admin/dashboard" className="text-xl font-bold">
                ガールズバー 管理画面
              </Link>
            </div>
            <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    'inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Menu as="div" className="relative ml-3">
              <div>
                <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <span className="sr-only">アカウントメニュー</span>
                  <UserIcon className="h-8 w-8 rounded-full bg-gray-100 p-1" />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/admin/profile"
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm text-gray-700'
                        )}
                      >
                        プロフィール
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        type="button"
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block w-full px-4 py-2 text-left text-sm text-gray-700'
                        )}
                      >
                        ログアウト
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="sr-only">メニューを開く</span>
              {open ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </Disclosure.Button>
          </div>
        </div>
      </div>

      <Disclosure.Panel className="sm:hidden">
        <div className="space-y-1 pb-3 pt-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Disclosure.Button
                as="button"
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
              >
                {item.name}
              </Disclosure.Button>
            </Link>
          ))}
        </div>
        <div className="border-t border-gray-200 pb-3 pt-4">
          <div className="space-y-1">
            <Link href="/admin/profile">
              <Disclosure.Button
                as="button"
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >
                プロフィール
              </Disclosure.Button>
            </Link>
            <Disclosure.Button
              as="button"
              onClick={handleLogout}
              className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            >
              ログアウト
            </Disclosure.Button>
          </div>
        </div>
      </Disclosure.Panel>
    </>
  )
}

export default function AdminHeader() {
  return (
    <Disclosure as="nav" className="bg-white shadow-sm">
      {({ open }) => <DisclosureContent open={open} />}
    </Disclosure>
  )
}
