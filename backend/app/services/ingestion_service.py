from apscheduler.schedulers.background import BackgroundScheduler

_scheduler = None

def start_ingestion_scheduler():
    global _scheduler
    if _scheduler is None:
        try:
            _scheduler = BackgroundScheduler(daemon=True)
            # Example scheduled task
            # _scheduler.add_job(fetch_all_districts_weather, 'interval', minutes=30)
            _scheduler.start()
            print("[Ingestion Service] Background scheduler started.")
        except Exception as e:
            print(f"[Ingestion Service] Notice: {e}")

def stop_ingestion_scheduler():
    global _scheduler
    if _scheduler is not None:
        try:
            _scheduler.shutdown(wait=False)
            print("[Ingestion Service] Background scheduler stopped.")
        except Exception as e:
            print(f"[Ingestion Service] Shutdown notice: {e}")
