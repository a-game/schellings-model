# schellings-model-sim

A React components that simulates Schelling's Segregation model.

## How to use

`npm install schellings-model-sim`

## Or

Clone this repo to your local computer, then run:

- `npm install && npm run build`

- To make this component available to other projects on your local computer, run `yarn link`.
- Then go to the project where you want to use this package and run `yarn link "schellings-model-sim"`.

Finally, to fix the multiple copies of React bug that shows up with linked React packages:

- navigate to the root of the `schellings-model-sim` package
- run `npm link "../path/to/your/project/mode_modules/react"`

## ...and then

You can now import `schellings-model-sim` as a normal package installed from npm like so:

```
import Model from 'schellings-model-sim'
```