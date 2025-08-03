import { relations } from "drizzle-orm/relations";
import { participants, participations, races, series, events, contests } from "./schema";

export const participationsRelations = relations(participations, ({one}) => ({
	participant: one(participants, {
		fields: [participations.participantId],
		references: [participants.id]
	}),
	race: one(races, {
		fields: [participations.raceId],
		references: [races.id]
	}),
}));

export const participantsRelations = relations(participants, ({one, many}) => ({
	participations: many(participations),
	contest: one(contests, {
		fields: [participants.contestId],
		references: [contests.id]
	}),
}));

export const racesRelations = relations(races, ({one, many}) => ({
	participations: many(participations),
	event: one(events, {
		fields: [races.eventId],
		references: [events.id]
	}),
	contest: one(contests, {
		fields: [races.contestId],
		references: [contests.id]
	}),
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	series: one(series, {
		fields: [events.seriesId],
		references: [series.id]
	}),
	races: many(races),
}));

export const seriesRelations = relations(series, ({many}) => ({
	events: many(events),
	contests: many(contests),
}));

export const contestsRelations = relations(contests, ({one, many}) => ({
	races: many(races),
	participants: many(participants),
	series: one(series, {
		fields: [contests.seriesId],
		references: [series.id]
	}),
}));