/**
 * @file Function Trajectory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Structure from '../structure/structure'
import Trajectory, { TrajectoryParameters } from './trajectory'

type TrajectoryFunction = (callback: Function, i?: number, atomIndices?: number[][]) => void

/**
 * Function trajectory class. Gets data from an JavaScript function.
 */
class FunctionTrajectory extends Trajectory {
  atomIndices: number[][]
  func: TrajectoryFunction

  constructor (func: TrajectoryFunction, structure: Structure, params: TrajectoryParameters) {
    super('', structure, params)
    this.func = func;
    this._init(structure)
  }

  get type () { return 'function' }

  _makeAtomIndices () {
    const atomIndices = []

    if (this.structure.type === 'StructureView') {
      const indices = this.structure.getAtomIndices()!  // TODO
      const n = indices.length

      let p = indices[ 0 ]
      let q = indices[ 0 ]

      for (let i = 1; i < n; ++i) {
        const r = indices[ i ]

        if (q + 1 < r) {
          atomIndices.push([ p, q + 1 ])
          p = r
        }

        q = r
      }

      atomIndices.push([ p, q + 1 ])
    } else {
      atomIndices.push([ 0, this.atomCount ])
    }

    this.atomIndices = atomIndices
  }

  _loadFrame (i: number, callback?: Function) {
    this.func(
      (i: number, box: ArrayLike<number>, coords: Float32Array, frameCount: number) => {
        this._process(i, box, coords, frameCount)
        if (typeof callback === 'function') {
          callback()
        }
      }, i, this.atomIndices)
  }

  _loadFrameCount () {
    this.func((count: number) => this._setFrameCount(count))
  }
}

export default FunctionTrajectory
