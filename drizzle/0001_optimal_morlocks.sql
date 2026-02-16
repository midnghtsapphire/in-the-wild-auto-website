CREATE TABLE `generations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`model` varchar(128) NOT NULL,
	`prompt` text NOT NULL,
	`response` text,
	`tokensInput` int DEFAULT 0,
	`tokensOutput` int DEFAULT 0,
	`totalTokens` int DEFAULT 0,
	`latencyMs` int,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`error` text,
	`chosenAsWinner` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`prompt` text NOT NULL,
	`status` enum('generating','verifying','ready','deployed','failed') NOT NULL DEFAULT 'generating',
	`generatedHtml` text,
	`generatedCss` text,
	`generatedJs` text,
	`framework` varchar(64) DEFAULT 'html',
	`deployUrl` varchar(512),
	`deploySlug` varchar(128),
	`customDomain` varchar(255),
	`verificationScore` int,
	`verificationNotes` text,
	`totalTokens` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `siteAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`date` timestamp NOT NULL,
	`pageViews` int DEFAULT 0,
	`uniqueVisitors` int DEFAULT 0,
	`avgSessionDuration` int DEFAULT 0,
	`bounceRate` decimal(5,2) DEFAULT '0.00',
	`topPages` text,
	`referrers` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `siteAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plan` enum('free','pro','business') NOT NULL DEFAULT 'free',
	`stripeSubscriptionId` varchar(128),
	`stripeCustomerId` varchar(128),
	`status` enum('active','canceled','past_due','trialing') NOT NULL DEFAULT 'active',
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelAtPeriodEnd` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(64) DEFAULT 'general',
	`tags` text,
	`prompt` text,
	`generatedHtml` text,
	`generatedCss` text,
	`generatedJs` text,
	`thumbnailUrl` varchar(512),
	`price` decimal(10,2) DEFAULT '0.00',
	`isFree` int DEFAULT 1,
	`downloads` int DEFAULT 0,
	`rating` decimal(3,2) DEFAULT '0.00',
	`isPublished` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tokenUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokensUsed` int NOT NULL DEFAULT 0,
	`model` varchar(128),
	`action` varchar(64),
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tokenUsage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `plan` enum('free','pro','business') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `tokensUsed` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `tokensQuota` int DEFAULT 50000 NOT NULL;