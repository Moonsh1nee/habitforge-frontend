self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const notifData = data.data ?? {};
  const actions =
    notifData.type === "task_reminder" && notifData.taskId
      ? [{ action: "snooze", title: "Отложить на 15 мин" }]
      : [];
  event.waitUntil(
    self.registration.showNotification(data.title ?? "HabitForge", {
      body: data.body ?? "",
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: { url: notifData.url ?? data.url ?? "/", type: notifData.type, taskId: notifData.taskId },
      actions,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  const { url = "/", taskId } = event.notification.data ?? {};
  event.notification.close();

  if (event.action === "snooze" && taskId) {
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
        const client = list.find((c) => "focus" in c);
        if (client) {
          client.postMessage({ type: "snooze-reminder", taskId, minutes: 15 });
          return client.focus();
        }
        return clients.openWindow ? clients.openWindow(url) : undefined;
      })
    );
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((list) => {
      for (const client of list) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
