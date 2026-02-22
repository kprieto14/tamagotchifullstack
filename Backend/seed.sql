INSERT INTO public."Behavior"("Message", "BreedId", "ActionId")
	VALUES ('wags its tail happily!', 1, 1);
INSERT INTO public."Behavior"("Message", "BreedId", "ActionId")
	VALUES ('enjoys a tasty treat!', 1, 2);
INSERT INTO public."Behavior"("Message", "BreedId", "ActionId")
	VALUES ('looks sad.', 1, 3);
INSERT INTO public."Behavior"("Message", "BreedId", "ActionId")
	VALUES ('licks your face affectionately!', 1, 4);

INSERT INTO public."Behavior"("Message", "BreedId", "ActionId")
	VALUES ('is enjoying their TV!', 2, 1);
INSERT INTO public."Behavior"("Message", "BreedId", "ActionId")
	VALUES ('purrs while eating!', 2, 2);
INSERT INTO public."Behavior"("Message", "BreedId", "ActionId")
	VALUES ('looks unamused.', 2, 3);
INSERT INTO public."Behavior"("Message", "BreedId", "ActionId")
	VALUES ('purrs happily!', 2, 4);

INSERT INTO public."Behavior"("Message", "BreedId", "ActionId")
	VALUES ('dances happily!', 3, 1);
INSERT INTO public."Behavior"("Message", "BreedId", "ActionId")
	VALUES ('looks satisfied!', 3, 2);
INSERT INTO public."Behavior"("Message", "BreedId", "ActionId")
	VALUES ('looks displeased.', 3, 3);
INSERT INTO public."Behavior"("Message", "BreedId", "ActionId")
	VALUES ('snuggles in your lap!', 3, 4);

SELECT * FROM public."Behavior"
INNER JOIN public."Breed" on "Behavior"."BreedId" = "Breed"."Id"
INNER JOIN public."Action" on "Behavior"."ActionId" = "Action"."Id";