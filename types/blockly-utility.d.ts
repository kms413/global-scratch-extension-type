/// <reference types="@turbowarp/types" />

/**
 * @fileoverview
 * Interface provided to block primitive functions for interacting with the
 * runtime, thread, target, and convenient methods.
 *
 * This mirrors the `BlockUtility` class from
 * `scratch-vm/src/engine/block-utility.js`. An instance of it is passed as the
 * `util` argument to every block primitive function of a custom extension.
 */
export default class BlocklyUtility {
  constructor(sequencer?: VM.Sequencer | null, thread?: VM.Thread | null)

  /**
   * A sequencer block primitives use to branch or start procedures with.
   */
  sequencer: VM.Sequencer | null

  /**
   * The block primitive's thread with the block's target, stack frame and
   * modifiable status.
   */
  thread: VM.Thread | null

  /**
   * Internal object used as the `now` timestamp source. Prefer reading
   * {@link nowObj} instead.
   */
  _nowObj: {
    now(): number;
  }

  /**
   * The target the primitive is working on.
   */
  get target(): VM.Target

  /**
   * The runtime the block primitive is running in.
   */
  get runtime(): VM.Runtime

  /**
   * Use the runtime's `currentMSecs` value as a timestamp value for now.
   * This is useful in some cases where we need compatibility with Scratch 2.
   */
  get nowObj(): {
    now(): number;
  }

  /**
   * The stack frame used by loop and other blocks to track internal state.
   */
  get stackFrame(): Record<string, any>

  /**
   * Check the stack timer and return a boolean based on whether it has finished or not.
   * @returns true if the stack timer has finished.
   */
  stackTimerFinished(): boolean

  /**
   * Check if the stack timer needs initialization.
   * @returns true if the stack timer needs to be initialized.
   */
  stackTimerNeedsInit(): boolean

  /**
   * Create and start a stack timer.
   * @param duration a duration in milliseconds to set the timer for.
   */
  startStackTimer(duration: number): void

  /**
   * Set the thread to yield.
   */
  yield(): void

  /**
   * Set the thread to yield until the next tick of the runtime.
   */
  yieldTick(): void

  /**
   * Start a branch in the current block.
   * @param branchNum Which branch to step to (i.e., 1, 2).
   * @param isLoop Whether this block is a loop.
   */
  startBranch(branchNum: number, isLoop: boolean): void

  /**
   * Stop all threads.
   */
  stopAll(): void

  /**
   * Stop threads on this target other than the thread holding the executed block.
   */
  stopOtherTargetThreads(): void

  /**
   * Stop this thread.
   */
  stopThisScript(): void

  /**
   * Start a specified procedure on this thread.
   * @param procedureCode Procedure code for procedure to start.
   */
  startProcedure(procedureCode: string): void

  /**
   * Get names and ids of parameters for the given procedure.
   * @param procedureCode Procedure code for procedure to query.
   * @returns A tuple of the parameter names and their ids.
   */
  getProcedureParamNamesAndIds(procedureCode: string): [string[], string[]]

  /**
   * Get names, ids, and defaults of parameters for the given procedure.
   * @param procedureCode Procedure code for procedure to query.
   * @returns A tuple of the parameter names, their ids, and their defaults.
   */
  getProcedureParamNamesIdsAndDefaults(procedureCode: string): [string[], string[], string[]]

  /**
   * Initialize procedure parameters in the thread before pushing parameters.
   */
  initParams(): void

  /**
   * Store a procedure parameter value by its name.
   * @param paramName The procedure's parameter name.
   * @param paramValue The procedure's parameter value.
   */
  pushParam(paramName: string, paramValue: VM.ScratchCompatibleValue): void

  /**
   * Retrieve the stored parameter value for a given parameter name.
   * @param paramName The procedure's parameter name.
   * @returns The parameter's current stored value.
   */
  getParam(paramName: string): VM.ScratchCompatibleValue | null

  /**
   * Start all relevant hats.
   * @param requestedHat Opcode of hats to start.
   * @param optMatchFields Optionally, fields to match on the hat.
   * @param optTarget Optionally, a target to restrict to.
   * @returns List of threads started by this function.
   */
  startHats(
    requestedHat: string,
    optMatchFields?: Record<string, unknown>,
    optTarget?: VM.Target
  ): VM.Thread[] | undefined

  /**
   * Query a named IO device.
   * @param device The name of the device, like keyboard.
   * @param func The name of the device's function to query.
   * @param args Arguments to pass to the device's function.
   * @returns The expected output for the device's function.
   */
  ioQuery<Device extends keyof VM.IODevices>(
    device: Device,
    func: keyof VM.IODevices[Device],
    args: unknown[]
  ): unknown
}