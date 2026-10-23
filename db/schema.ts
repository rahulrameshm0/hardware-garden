import {sqliteTable,text,integer,primaryKey} from 'drizzle-orm/sqlite-core';
export const learningProgress=sqliteTable('learning_progress',{
 userId:text('user_id').notNull(),lessonId:text('lesson_id').notNull(),completed:integer('completed').notNull().default(0),score:integer('score').notNull().default(0),step:integer('step').notNull().default(0),positionAt:integer('position_at').notNull().default(0),bookmarked:integer('bookmarked').notNull().default(0),bookmarkAt:integer('bookmark_at').notNull().default(0)
},table=>[primaryKey({columns:[table.userId,table.lessonId]})]);
