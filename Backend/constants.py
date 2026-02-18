# Future iteration can add personality traits and other attributes that can be specific to a breed with user input
# CONISDER CREATING FROM LOOK-UP TABLE TO GRAB FROM DB EVERY TIME SERVER RE-STARTS
BREEDS = {
    'Benshis': {
        'Play': 'wags its tail happily!',
        'Feed': 'enjoys a tasty treat!',
        'Scold': 'looks sad.',
        'Hug': 'licks your face affectionately!',
    },
    'Moomis': {
        'Play': 'is enjoying their TV!',
        'Feed': 'purrs while eating!',
        'Scold': 'looks unamused.',
        'Hug': 'purrs happily!',
    },
    'Pooshis': {
        'Play': 'dances happily!',
        'Feed': 'looks satisfied!',
        'Scold': 'looks displeased.',
        'Hug': 'snuggles in your lap!',
    }
}

ACTIONS = {
    'Play': {},
    'Feed': {},
    'Scold': {},
    'Hug': {},
    'Rename': {}
}