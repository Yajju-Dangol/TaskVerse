-- Function to handle submission approval automatically
-- This runs with SECURITY DEFINER privileges to bypass RLS checks for Profile updates
CREATE OR REPLACE FUNCTION handle_submission_approval()
RETURNS TRIGGER AS $$
DECLARE
  task_points INTEGER;
  current_points INTEGER;
  new_points INTEGER;
  new_level INTEGER;
  completed_count INTEGER;
  avg_rating DECIMAL;
BEGIN
  -- Only run if status changed to 'approved'
  IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
    
    -- 1. Get Points for the Task
    SELECT points INTO task_points FROM tasks WHERE id = NEW.task_id;
    
    -- 2. Update Intern Profile (Points & Level)
    SELECT points INTO current_points FROM profiles WHERE id = NEW.intern_id;
    new_points := COALESCE(current_points, 0) + COALESCE(task_points, 0);
    new_level := floor(new_points / 100) + 1;
    
    UPDATE profiles 
    SET points = new_points, 
        level = new_level 
    WHERE id = NEW.intern_id;

    -- 3. Mark Task as Completed
    UPDATE tasks SET status = 'completed' WHERE id = NEW.task_id;

    -- 4. Check and Award Badges
    
    -- Get stats
    SELECT count(*) INTO completed_count FROM submissions 
    WHERE intern_id = NEW.intern_id AND status = 'approved';
    
    SELECT AVG(rating) INTO avg_rating FROM submissions 
    WHERE intern_id = NEW.intern_id AND status = 'approved';
    
    -- Badge: First Task (1 task completed)
    IF completed_count >= 1 THEN
      INSERT INTO intern_badges (intern_id, badge_id)
      SELECT NEW.intern_id, id FROM badges WHERE name = 'First Task'
      ON CONFLICT DO NOTHING;
    END IF;

    -- Badge: Fast Learner (5 tasks completed)
    IF completed_count >= 5 THEN
       INSERT INTO intern_badges (intern_id, badge_id)
       SELECT NEW.intern_id, id FROM badges WHERE name = 'Fast Learner'
       ON CONFLICT DO NOTHING;
    END IF;

    -- Badge: Point Master (500 points earned)
    IF new_points >= 500 THEN
       INSERT INTO intern_badges (intern_id, badge_id)
       SELECT NEW.intern_id, id FROM badges WHERE name = 'Point Master'
       ON CONFLICT DO NOTHING;
    END IF;
    
    -- Badge: Top Rated (Avg Rating >= 4.5)
    IF avg_rating >= 4.5 AND completed_count >= 3 THEN
       INSERT INTO intern_badges (intern_id, badge_id)
       SELECT NEW.intern_id, id FROM badges WHERE name = 'Top Rated'
       ON CONFLICT DO NOTHING;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger
DROP TRIGGER IF EXISTS on_submission_status_change ON submissions;
CREATE TRIGGER on_submission_status_change
  AFTER UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION handle_submission_approval();
