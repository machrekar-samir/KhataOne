import { useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ChevronDown,
} from "lucide-react";

import { Heading } from "../components/PageParts.jsx";
import { useApp } from "../context/useApp.js";
import { useAuth } from "../context/useAuth.js";

import {
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService.js";

export default function Notifications() {
  const { notifications = [] } = useApp();
  const { user } = useAuth();

  const [openId, setOpenId] = useState(null);
  const [busy, setBusy] = useState(false);

  const unread = notifications.filter(
    (item) => !item.read,
  );

  const today = notifications.filter(
    (item) => {
      const date = getDate(item.createdAt);

      return (
        date &&
        date.toDateString() ===
          new Date().toDateString()
      );
    },
  );

  const earlier = notifications.filter(
    (item) => !today.includes(item),
  );

  const openNotification = async (item) => {
    const opening =
      openId !== item.id;

    setOpenId(
      opening ? item.id : null,
    );

    if (
      opening &&
      !item.read &&
      user?.uid
    ) {
      try {
        await markNotificationRead(
          user.uid,
          item.id,
        );
      } catch (error) {
        console.error(
          "Mark notification error:",
          error,
        );
      }
    }
  };

  const markAll = async () => {
    if (
      !unread.length ||
      !user?.uid
    ) {
      return;
    }

    setBusy(true);

    try {
      await markAllNotificationsRead(
        user.uid,
      );
    } catch (error) {
      console.error(
        "Mark all error:",
        error,
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async (
    event,
    id,
  ) => {
    event.stopPropagation();

    if (!user?.uid) return;

    try {
      await deleteNotification(
        user.uid,
        id,
      );

      if (openId === id) {
        setOpenId(null);
      }
    } catch (error) {
      console.error(
        "Delete notification error:",
        error,
      );
    }
  };

  return (
    <Heading
      eyebrow="ACTIVITY CENTER"
      title="Notifications"
    >
      <div className="rounded-xl border border-[#ebe7e3] bg-white p-5 shadow-sm dark:border-[#423238] dark:bg-[#2b2226]">

        {/* HEADER */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f9e7e9] text-[#8f2039]">
              <Bell size={17} />
            </span>

            <div>
              <p className="text-sm font-bold text-[#263047] dark:text-white">
                Activity notifications
              </p>

              <p className="text-[10px] text-[#8b8383]">
                {unread.length} unread
              </p>
            </div>
          </div>

          <button
            onClick={markAll}
            disabled={
              busy ||
              unread.length === 0
            }
            className="flex items-center gap-1.5 rounded-lg border border-[#ddd5d0] px-3 py-2 text-[10px] font-semibold text-[#7a2633] transition hover:border-[#8f2039] hover:bg-[#faf0f2] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        </div>

        {/* TODAY */}
        {today.length > 0 && (
          <>
            <p className="mb-2 text-[9px] font-bold tracking-[1.2px] text-[#aaa0a0]">
              TODAY
            </p>

            {today.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                openId={openId}
                onOpen={openNotification}
                onDelete={remove}
              />
            ))}
          </>
        )}

        {/* EARLIER */}
        {earlier.length > 0 && (
          <>
            <p className="mb-2 mt-6 text-[9px] font-bold tracking-[1.2px] text-[#aaa0a0]">
              EARLIER
            </p>

            {earlier.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                openId={openId}
                onOpen={openNotification}
                onDelete={remove}
              />
            ))}
          </>
        )}

        {/* EMPTY */}
        {!notifications.length && (
          <div className="py-12 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f8eeee] text-[#8f2039]">
              <Check size={22} />
            </span>

            <p className="mt-3 text-sm font-semibold text-[#51494b] dark:text-white">
              You are all caught up.
            </p>

            <p className="mt-1 text-xs text-[#8b8383]">
              New activity will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </Heading>
  );
}

function NotificationItem({
  item,
  openId,
  onOpen,
  onDelete,
}) {
  const isOpen =
    openId === item.id;

  return (
    <div
      onClick={() => onOpen(item)}
      className={`cursor-pointer border-b border-[#ebe7e3] last:border-0 dark:border-[#423238] ${
        !item.read
          ? "bg-[#fffafa]"
          : ""
      }`}
    >
      <div className="group flex items-start gap-3 py-3">

        {/* ICON */}
        <span
          className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
            item.read
              ? "bg-[#f1efed] text-[#8b8383]"
              : "bg-[#f9e7e9] text-[#8f2039]"
          }`}
        >
          <Bell size={14} />
        </span>

        {/* TEXT */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <strong
              className={`flex-1 text-sm ${
                item.read
                  ? "font-medium text-[#665e60]"
                  : "font-bold text-[#263047] dark:text-white"
              }`}
            >
              {item.text}
            </strong>

            <ChevronDown
              size={15}
              className={`mt-0.5 shrink-0 text-[#8b8383] transition-transform ${
                isOpen
                  ? "rotate-180"
                  : ""
              }`}
            />
          </div>

          <p className="mt-1 text-[10px] text-[#8b8383]">
            KhataOne activity
            {getDate(item.createdAt) &&
              ` · ${formatTime(
                item.createdAt,
              )}`}
          </p>

          {/* OPEN DETAILS */}
          {isOpen && (
            <div className="mt-3 rounded-xl border border-[#eadede] bg-[#fffdfb] p-3 dark:border-[#493b40] dark:bg-[#30262b]">
              <p className="text-xs leading-5 text-[#5e5658] dark:text-[#d6cccf]">
                {item.text}
              </p>

              <p className="mt-2 text-[10px] text-[#999092]">
                {getDate(item.createdAt)
                  ? getDate(
                      item.createdAt,
                    ).toLocaleString(
                      "en-IN",
                    )
                  : "Just now"}
              </p>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={(event) =>
              onDelete(
                event,
                item.id,
              )
            }
            title="Delete"
            className="grid h-7 w-7 place-items-center rounded-lg text-[#9a9191] opacity-60 transition hover:bg-[#fff0f1] hover:text-[#b63e4d] sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Trash2 size={14} />
          </button>

          {/* READ DOT */}
          <i
            className={`mt-1 size-2 rounded-full transition-colors ${
              item.read
                ? "bg-[#d8cfca]"
                : "bg-[#8f2039]"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

function getDate(value) {
  if (!value) return null;

  if (value?.toDate) {
    return value.toDate();
  }

  if (value?.seconds) {
    return new Date(
      value.seconds * 1000,
    );
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function formatTime(value) {
  const date = getDate(value);

  if (!date) return "";

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );
}