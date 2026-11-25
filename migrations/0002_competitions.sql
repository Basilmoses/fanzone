CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  prompt TEXT NOT NULL,
  options_json TEXT NOT NULL,
  correct_index INTEGER NOT NULL CHECK (correct_index >= 0 AND correct_index < 4),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS competitions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('daily', 'head_to_head')),
  title TEXT NOT NULL,
  invite_code TEXT UNIQUE,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  opponent_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  winner_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  daily_date TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('open', 'active', 'completed', 'expired')),
  starts_at INTEGER NOT NULL,
  ends_at INTEGER NOT NULL,
  accepted_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS competitions_created_by_idx ON competitions(created_by, status);
CREATE INDEX IF NOT EXISTS competitions_opponent_idx ON competitions(opponent_user_id, status);
CREATE INDEX IF NOT EXISTS competitions_daily_idx ON competitions(type, daily_date, status);

CREATE TABLE IF NOT EXISTS competition_question_sets (
  competition_id TEXT PRIMARY KEY REFERENCES competitions(id) ON DELETE CASCADE,
  question_ids_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  competition_id TEXT REFERENCES competitions(id) ON DELETE SET NULL,
  mode TEXT NOT NULL CHECK (mode IN ('quick', 'daily', 'head_to_head')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  started_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  submitted_at INTEGER,
  duration_ms INTEGER,
  UNIQUE (competition_id, user_id)
);

CREATE INDEX IF NOT EXISTS quiz_attempts_user_idx ON quiz_attempts(user_id, status, submitted_at);
CREATE INDEX IF NOT EXISTS quiz_attempts_competition_idx ON quiz_attempts(competition_id, status, score, duration_ms);

CREATE TABLE IF NOT EXISTS attempt_questions (
  attempt_id TEXT NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id),
  position INTEGER NOT NULL,
  selected_index INTEGER CHECK (selected_index IS NULL OR selected_index BETWEEN 0 AND 3),
  is_correct INTEGER CHECK (is_correct IS NULL OR is_correct IN (0, 1)),
  PRIMARY KEY (attempt_id, question_id),
  UNIQUE (attempt_id, position)
);

INSERT OR IGNORE INTO questions (id, category, prompt, options_json, correct_index) VALUES
('q1','Premier League','Which club won the first Premier League title in 1992/93?','["Arsenal","Manchester United","Blackburn Rovers","Leeds United"]',1),
('q2','Premier League','Who holds the record for most Premier League goals?','["Wayne Rooney","Harry Kane","Alan Shearer","Sergio Agüero"]',2),
('q3','Premier League','Which team went unbeaten through the 2003/04 season?','["Chelsea","Arsenal","Man United","Liverpool"]',1),
('q4','Premier League','Leicester City won the league in which season?','["2014/15","2015/16","2016/17","2013/14"]',1),
('q5','Premier League','How many points did Man City set as the record in 2017/18?','["98","99","100","102"]',2),
('q6','Champions League','Which club has won the most Champions League / European Cup titles?','["AC Milan","Bayern Munich","Liverpool","Real Madrid"]',3),
('q7','Champions League','Who is the all-time top scorer in the Champions League?','["Lionel Messi","Cristiano Ronaldo","Robert Lewandowski","Raúl"]',1),
('q8','Champions League','Liverpool’s 2005 Miracle of Istanbul final was against?','["Juventus","AC Milan","Barcelona","Inter Milan"]',1),
('q9','Champions League','Which English club won the 2021 Champions League final?','["Man City","Liverpool","Chelsea","Tottenham"]',2),
('q10','World Cup','Which country has won the most FIFA World Cups?','["Germany","Italy","Argentina","Brazil"]',3),
('q11','World Cup','Who won the 2022 World Cup Golden Ball?','["Kylian Mbappé","Lionel Messi","Luka Modrić","Julián Álvarez"]',1),
('q12','World Cup','Where was the 2010 FIFA World Cup held?','["Brazil","Germany","South Africa","Japan"]',2),
('q13','World Cup','Who is the all-time top scorer at World Cup finals?','["Ronaldo Nazário","Miroslav Klose","Just Fontaine","Pelé"]',1),
('q14','AFCON','Which nation has won the most AFCON titles?','["Cameroon","Ghana","Egypt","Nigeria"]',2),
('q15','AFCON','Nigeria’s Super Eagles won AFCON in 1980, 1994 and which other year?','["2000","2013","2004","2019"]',1),
('q16','AFCON','Who won AFCON 2023 (played in 2024)?','["Nigeria","Ivory Coast","South Africa","Senegal"]',1),
('q17','AFCON','Who is AFCON’s all-time top scorer?','["Samuel Eto’o","Didier Drogba","Rashidi Yekini","Laurent Pokou"]',0),
('q18','Legends','Jay-Jay Okocha played for which English club?','["Bolton Wanderers","Everton","Fulham","Aston Villa"]',0),
('q19','Legends','Which legend is nicknamed O Fenômeno?','["Ronaldinho","Ronaldo Nazário","Romário","Kaká"]',1),
('q20','Legends','George Weah won the Ballon d’Or in which year?','["1993","1995","1997","1999"]',1),
('q21','Legends','Zinedine Zidane headbutted which player in the 2006 final?','["Gattuso","Cannavaro","Materazzi","Pirlo"]',2),
('q22','Clubs','Which club plays home games at Anfield?','["Everton","Liverpool","Man City","Leeds"]',1),
('q23','Clubs','Which club is nicknamed The Old Lady?','["AC Milan","Juventus","Roma","Napoli"]',1),
('q24','Clubs','Signal Iduna Park is home to?','["Bayern Munich","Schalke","Borussia Dortmund","Leipzig"]',2),
('q25','Clubs','Enyimba FC is based in which Nigerian city?','["Lagos","Kano","Aba","Enugu"]',2),
('q26','International','Who won Euro 2020 (played in 2021)?','["England","Italy","Spain","France"]',1),
('q27','International','Who has the most international goals in men’s football?','["Ali Daei","Lionel Messi","Cristiano Ronaldo","Sunil Chhetri"]',2),
('q28','International','Which country won Olympic football gold at Atlanta 1996?','["Brazil","Argentina","Nigeria","Cameroon"]',2),
('q29','International','Copa América 2024 was won by?','["Brazil","Uruguay","Colombia","Argentina"]',3),
('q30','World Cup','Which African nation reached the 2022 World Cup semi-finals?','["Senegal","Morocco","Ghana","Cameroon"]',1);
