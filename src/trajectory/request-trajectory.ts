/**
 * @file Request Trajectory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Structure from '../structure/structure'
import Trajectory, { TrajectoryParameters } from './trajectory'

/**
 * Request trajectory class. Gets data from an JavaScript function.
 */
class RequestTrajectory extends Trajectory {
  atomIndices: number[][]
  request: Function

  constructor (request: Function, structure: Structure, params: TrajectoryParameters) {
    super('', structure, params)
    this.request = request;
    this._init(structure)
  }

  get type () { return 'request' }

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
    this.request('frame', { frame: i, atomIndices: this.atomIndices },
      (i: number, box: ArrayLike<number>, coords: Float32Array, frameCount: number) => {
        this._process(i, box, coords, frameCount)
        if (typeof callback === 'function') {
          callback()
        }
      });
  }

  _loadFrameCount () {
    this.request('count', {}, this._setFrameCount.bind(this))
  }
}

export default RequestTrajectory
